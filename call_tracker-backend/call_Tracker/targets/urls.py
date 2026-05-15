from django.urls import path
from .views import AdminTargetListView, AdminTargetSetView, EmployeeTargetView

urlpatterns = [
    path('admin/', AdminTargetListView.as_view()),
    path('admin/set/', AdminTargetSetView.as_view()),
    path('my/', EmployeeTargetView.as_view()),
]
