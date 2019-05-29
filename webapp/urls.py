from django.urls import path
from . import views

urlpatterns = [
    path('', views.start, name='webapp-start'),
    path('home', views.home, name='webapp-home')
]
