from django.shortcuts import render, redirect
from .dataProcessing import TaskLogic

taskwork = TaskLogic()

def start(request):

    return render(request, 'webapp/start.html', {'title' : 'Start'})

def home(request):

    taskwork.setEndTime(request.POST['timeTohardfork'])
    taskwork.startLoop()

    return render(request, 'webapp/home.html', {'title' : 'Work page'})
