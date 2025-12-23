# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, LessonViewSet, CourseListCreateView, CourseDetailView,
    LessonCreateView, LessonsByCourseView, TestViewSet, TestDetailView,
    TestByLessonView, CreateTestForLessonView, QuestionViewSet, StartTestView,
    SubmitTestView, TestSubmissionResultView, ReviewOpenAnswerView
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'tests', TestViewSet)
router.register(r'questions', QuestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Course related URLs
    path('courses/', CourseListCreateView.as_view(), name='course-list-create'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:course_id>/lessons/', LessonCreateView.as_view(), name='lesson-create'),
    path('courses/<int:course_id>/lessons/list/', LessonsByCourseView.as_view(), name='lessons-by-course'),
    
    # Test related URLs
    path('tests/<int:pk>/', TestDetailView.as_view(), name='test-detail'),
    path('lessons/<int:lesson_id>/test/', TestByLessonView.as_view(), name='test-by-lesson'),
    path('lessons/<int:lesson_id>/create-test/', CreateTestForLessonView.as_view(), name='create-test-for-lesson'),
    
    # Test submission URLs
    path('tests/<int:test_id>/start/', StartTestView.as_view(), name='start-test'),
    path('test-submissions/<int:submission_id>/submit/', SubmitTestView.as_view(), name='submit-test'),
    path('test-submissions/<int:pk>/result/', TestSubmissionResultView.as_view(), name='test-submission-result'),
    
    # Review open-ended answers
    path('answers/<int:pk>/review/', ReviewOpenAnswerView.as_view(), name='review-open-answer'),
]