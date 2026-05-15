from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'created_by_username', 'created_at']
        read_only_fields = ['id', 'created_by_username', 'created_at']
