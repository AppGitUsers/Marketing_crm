from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Project
from .serializers import ProjectSerializer


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, "role", None) == "admin" or request.user.is_superuser)
        )


class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all().order_by('name')
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        # Only the creator or an admin can delete
        if request.user != project.created_by and getattr(request.user, 'role', None) != 'admin':
            return Response(
                {"detail": "You do not have permission to delete this project."},
                status=status.HTTP_403_FORBIDDEN
            )
        project.delete()
        return Response({"message": "Project deleted successfully"}, status=status.HTTP_200_OK)
