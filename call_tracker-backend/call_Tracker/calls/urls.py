from django.urls import path
from .views import CallCreateView, EmployeeCallsView, CallDetailView

urlpatterns = [
    path("", CallCreateView.as_view()),
    path("my-calls/", EmployeeCallsView.as_view()),
    path("<int:pk>/", CallDetailView.as_view()),
]