from django.conf.urls import include, url
from django.contrib import admin
import marketstories.views as view

urlpatterns = [
    url(r'^$', view.StoryView.as_view(), name ='search'),   
]
