# serializers.py
from rest_framework import serializers
from .models import Course, Lesson, Test, Question, Choice, TestSubmission, Answer

class LessonSerializer(serializers.ModelSerializer):
    has_test = serializers.SerializerMethodField()
    test_id = serializers.SerializerMethodField()
    next_lesson_id = serializers.SerializerMethodField()
    prev_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'
        extra_kwargs = {
            'course': {'required': False},
            'quiz': {'write_only': True, 'help_text': 'Deprecated: Use Test model instead'}
        }
    
    def get_has_test(self, obj):
        return hasattr(obj, 'test')
    
    def get_test_id(self, obj):
        if hasattr(obj, 'test'):
            return obj.test.id
        return None

    def get_next_lesson_id(self, obj):
        # Find the next lesson in the same course with a higher ID
        next_lesson = Lesson.objects.filter(course=obj.course, id__gt=obj.id).order_by('id').first()
        if next_lesson:
            return next_lesson.id
        return None

    def get_prev_lesson_id(self, obj):
        # Find the previous lesson in the same course with a lower ID
        prev_lesson = Lesson.objects.filter(course=obj.course, id__lt=obj.id).order_by('-id').first()
        if prev_lesson:
            return prev_lesson.id
        return None

class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=False, required=False)

    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'points', 'order', 'choices', 'correct_answer', 'explanation']

    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        question = Question.objects.create(**validated_data)
        
        for choice_data in choices_data:
            Choice.objects.create(question=question, **choice_data)
        
        return question

    def update(self, instance, validated_data):
        choices_data = validated_data.pop('choices', [])
        instance = super().update(instance, validated_data)
        
        # Handle existing choices - delete, update or create
        if choices_data:
            instance.choices.all().delete()  # Remove existing choices
            for choice_data in choices_data:
                Choice.objects.create(question=instance, **choice_data)
        
        return instance

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = ['id', 'lesson', 'title', 'description', 'passing_score', 
                  'time_limit', 'created_at', 'questions']

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'question', 'selected_choices', 'text_answer', 'is_correct', 'feedback']

class TestSubmissionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = TestSubmission
        fields = ['id', 'test', 'user', 'score', 'start_time', 'end_time', 
                  'is_completed', 'answers']
        extra_kwargs = {
            'user': {'required': False}
        }

class TestWithQuestionsSerializer(TestSerializer):
    questions = QuestionSerializer(many=True, read_only=False)
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        test = Test.objects.create(**validated_data)
        
        for question_data in questions_data:
            choices_data = question_data.pop('choices', [])
            question = Question.objects.create(test=test, **question_data)
            
            for choice_data in choices_data:
                Choice.objects.create(question=question, **choice_data)
        
        return test

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', [])
        instance = super().update(instance, validated_data)
        
        # Handle existing questions
        if questions_data is not None:
            instance.questions.all().delete()  # Remove existing questions
            
            for question_data in questions_data:
                choices_data = question_data.pop('choices', [])
                question = Question.objects.create(test=instance, **question_data)
                
                for choice_data in choices_data:
                    Choice.objects.create(question=question, **choice_data)
        
        return instance

class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_choice_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    text_answer = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        question_id = data.get('question_id')
        question = Question.objects.get(id=question_id)
        
        if question.question_type == 'MCQ' and not data.get('selected_choice_ids'):
            raise serializers.ValidationError("Multiple choice questions require selected choices")
            
        if question.question_type == 'OPEN' and not data.get('text_answer'):
            raise serializers.ValidationError("Open ended questions require a text answer")
            
        return data

