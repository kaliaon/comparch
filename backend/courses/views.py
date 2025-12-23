# views.py
from rest_framework.viewsets import ModelViewSet
from .models import Course, Lesson, Test, Question, Choice, TestSubmission, Answer
from .serializers import (
    CourseSerializer, LessonSerializer, TestSerializer, QuestionSerializer,
    ChoiceSerializer, TestSubmissionSerializer, AnswerSerializer,
    TestWithQuestionsSerializer, SubmitAnswerSerializer
)
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404

class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class LessonViewSet(ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class LessonsByCourseView(generics.ListAPIView):
    serializer_class = LessonSerializer

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Lesson.objects.filter(course_id=course_id)

class LessonCreateView(generics.CreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    parser_classes = [JSONParser]

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        course = Course.objects.get(id=course_id)
        serializer.save(course=course)

# Test related views
class TestViewSet(ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TestWithQuestionsSerializer
        return TestSerializer

class TestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TestWithQuestionsSerializer
        return TestSerializer

class TestByLessonView(generics.RetrieveAPIView):
    serializer_class = TestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        lesson_id = self.kwargs['lesson_id']
        return get_object_or_404(Test, lesson_id=lesson_id)

class CreateTestForLessonView(generics.CreateAPIView):
    serializer_class = TestWithQuestionsSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        lesson_id = self.kwargs.get('lesson_id')
        lesson = get_object_or_404(Lesson, id=lesson_id)
        serializer.save(lesson=lesson)

class QuestionViewSet(ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

class StartTestView(generics.CreateAPIView):
    serializer_class = TestSubmissionSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        test_id = self.kwargs.get('test_id')
        test = get_object_or_404(Test, id=test_id)
        serializer.save(test=test, user=self.request.user)

class SubmitTestView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, submission_id):
        submission = get_object_or_404(TestSubmission, id=submission_id, user=request.user)
        
        if submission.is_completed:
            return Response({"detail": "Test has already been submitted"}, status=status.HTTP_400_BAD_REQUEST)
        
        answers_data = request.data.get('answers', [])
        total_points = 0
        earned_points = 0
        
        for answer_data in answers_data:
            serializer = SubmitAnswerSerializer(data=answer_data)
            serializer.is_valid(raise_exception=True)
            
            question_id = serializer.validated_data['question_id']
            question = get_object_or_404(Question, id=question_id, test=submission.test)
            total_points += question.points
            
            # Create the answer object
            answer = Answer.objects.create(
                submission=submission,
                question=question,
                text_answer=serializer.validated_data.get('text_answer', '')
            )
            
            # For MCQ, process the selected choices
            if question.question_type == 'MCQ':
                selected_choice_ids = serializer.validated_data.get('selected_choice_ids', [])
                selected_choices = Choice.objects.filter(id__in=selected_choice_ids, question=question)
                answer.selected_choices.set(selected_choices)
                
                # Check if the answer is correct
                all_choices = question.choices.all()
                correct_choices = all_choices.filter(is_correct=True)
                selected_correct = selected_choices.filter(is_correct=True)
                
                # Answer is correct if all correct choices are selected and no incorrect ones
                is_correct = (selected_choices.count() == selected_correct.count() and 
                             selected_correct.count() == correct_choices.count())
                
                answer.is_correct = is_correct
                
                if is_correct:
                    earned_points += question.points
            
            # For open-ended questions, check against the correct_answer if available
            else:
                text_answer = serializer.validated_data.get('text_answer', '').strip().lower()
                
                # If question has a correct_answer, perform a basic evaluation
                if question.correct_answer and text_answer:
                    # A very basic similarity check - in a real implementation, you might 
                    # want to use more sophisticated NLP techniques
                    correct_answer_lower = question.correct_answer.lower()
                    
                    # Simple evaluation based on key terms
                    key_terms = [term.strip() for term in correct_answer_lower.replace('.', ',').replace(';', ',').split(',')]
                    key_terms = [term for term in key_terms if len(term) > 5]  # Only consider meaningful terms
                    
                    matched_terms = sum(1 for term in key_terms if term in text_answer)
                    total_terms = len(key_terms) if key_terms else 1
                    
                    # Calculate similarity score
                    similarity = matched_terms / total_terms if total_terms > 0 else 0
                    
                    # Set a threshold for considering the answer correct
                    if similarity >= 0.3:  # Matches at least 30% of key terms
                        answer.is_correct = True
                        earned_points += question.points
                    else:
                        answer.is_correct = False
                    
                    answer.feedback = f"Your answer matched {matched_terms} out of {total_terms} key concepts."
                else:
                    answer.is_correct = None  # To be reviewed manually
            
            answer.save()
        
        # Calculate score as a percentage
        if total_points > 0:
            score_percentage = (earned_points / total_points) * 100
        else:
            score_percentage = 0
            
        # Update the submission
        submission.score = score_percentage
        submission.end_time = timezone.now()
        submission.is_completed = True
        submission.save()
        
        return Response({
            "id": submission.id,
            "score": submission.score,
            "passing_score": submission.test.passing_score,
            "passed": submission.score >= submission.test.passing_score,
            "completed": True
        })

class TestSubmissionResultView(generics.RetrieveAPIView):
    serializer_class = TestSubmissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Check if this is a schema generation request
        if getattr(self, 'swagger_fake_view', False):
            # Return empty queryset for schema generation
            return TestSubmission.objects.none()
        return TestSubmission.objects.filter(user=self.request.user)

class ReviewOpenAnswerView(generics.UpdateAPIView):
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only allow updating answers where the question type is OPEN
        return Answer.objects.filter(question__question_type='OPEN')
    
    def update(self, request, *args, **kwargs):
        answer = self.get_object()
        
        # Check if user has permission to review (e.g., is_staff)
        if not request.user.is_staff:
            return Response({"detail": "You do not have permission to review answers."}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        is_correct = request.data.get('is_correct')
        feedback = request.data.get('feedback', '')
        
        answer.is_correct = is_correct
        answer.feedback = feedback
        answer.save()
        
        # Update the overall score of the submission
        submission = answer.submission
        answers = submission.answers.all()
        
        total_points = sum(answer.question.points for answer in answers)
        earned_points = sum(answer.question.points for answer in answers if answer.is_correct)
        
        if total_points > 0:
            submission.score = (earned_points / total_points) * 100
        submission.save()
        
        return Response(self.get_serializer(answer).data)