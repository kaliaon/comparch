from django.contrib import admin
from .models import Course, Lesson, Test, Question, Choice, TestSubmission, Answer

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')
    inlines = [LessonInline]

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 3

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 3
    fields = ('text', 'question_type', 'points', 'order')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'created_at')
    list_filter = ('course',)
    search_fields = ('title',)

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'passing_score', 'time_limit', 'created_at')
    list_filter = ('lesson__course',)
    search_fields = ('title', 'description')
    inlines = [QuestionInline]

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'test', 'question_type', 'points', 'order')
    list_filter = ('test', 'question_type')
    search_fields = ('text',)
    inlines = [ChoiceInline]

class AnswerInline(admin.TabularInline):
    model = Answer
    readonly_fields = ('question', 'selected_choices', 'text_answer')
    extra = 0
    can_delete = False

@admin.register(TestSubmission)
class TestSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'score', 'start_time', 'end_time', 'is_completed')
    list_filter = ('test', 'is_completed')
    readonly_fields = ('user', 'test', 'score', 'start_time', 'end_time', 'is_completed')
    inlines = [AnswerInline]

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('submission', 'question', 'is_correct')
    list_filter = ('is_correct', 'question__question_type')
    readonly_fields = ('submission', 'question', 'selected_choices', 'text_answer')
    fields = ('submission', 'question', 'selected_choices', 'text_answer', 'is_correct', 'feedback')
