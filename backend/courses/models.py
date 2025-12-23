# models.py
from django.db import models
from django.conf import settings

class Course(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    video_url = models.URLField()
    quiz = models.JSONField(default=dict, help_text="Deprecated: Use Test model instead")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    @property
    def has_test(self):
        """Check if this lesson has an associated test"""
        return hasattr(self, 'test')

class QuestionType(models.TextChoices):
    MULTIPLE_CHOICE = 'MCQ', 'Multiple Choice Question'
    OPEN_ENDED = 'OPEN', 'Open Ended Question'

class Test(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name="test")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    passing_score = models.PositiveIntegerField(default=70, help_text="Percentage required to pass")
    time_limit = models.PositiveIntegerField(default=30, help_text="Time limit in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Test for {self.lesson.title}"

class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    question_type = models.CharField(
        max_length=4,
        choices=QuestionType.choices,
        default=QuestionType.MULTIPLE_CHOICE
    )
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    correct_answer = models.TextField(blank=True, null=True, help_text="Model answer for open-ended questions")
    explanation = models.TextField(blank=True, null=True, help_text="Explanation for the correct answer")
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.get_question_type_display()}: {self.text[:50]}"

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return self.text

class TestSubmission(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="submissions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="test_submissions")
    score = models.FloatField(null=True, blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username}'s submission for {self.test.title}"

class Answer(models.Model):
    submission = models.ForeignKey(TestSubmission, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choices = models.ManyToManyField(Choice, blank=True)
    text_answer = models.TextField(blank=True, null=True)
    is_correct = models.BooleanField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Answer to {self.question.text[:30]}"
