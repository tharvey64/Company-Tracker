from django.conf.urls import include, url
from django.contrib import admin
import twitter.views as view

urlpatterns = [
    url(r'^search/random$', view.SearchView.as_view(), name ='postsearch'),
    url(r'^search/lists$', view.SearchListView.as_view(), name ='listsearch'),
    url(r'^oauth/$', view.AppView.as_view(), name='oauth'),
	url(r'^callback/$', view.CallbackView.as_view(), name ='index')    
]
