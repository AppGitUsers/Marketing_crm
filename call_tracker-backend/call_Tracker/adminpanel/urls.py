from django.urls import path
from .views import (
    AdminEmployeeListCreateView,
    AdminEmployeeDetailView,
    AdminCallsView,
    AdminCallDetailView,
    AdminReportsView,
)

urlpatterns = [
    path("employees/", AdminEmployeeListCreateView.as_view()),
    path("employees/<int:pk>/", AdminEmployeeDetailView.as_view()),
    path("calls/", AdminCallsView.as_view()),
    path("calls/<int:pk>/", AdminCallDetailView.as_view()),
    path("reports/", AdminReportsView.as_view()),
]