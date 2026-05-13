from django.contrib import admin
from django.urls import path,include
from django.http import HttpResponse


def home(request):
    return HttpResponse("Call Tracker Backend is running")

urlpatterns = [
    path("", home),

    path('admin/', admin.site.urls),

    path('api/accounts/', include('accounts.urls')),
    path('api/calls/',include('calls.urls')),
    path("api/admin/", include("adminpanel.urls")),
    
]

