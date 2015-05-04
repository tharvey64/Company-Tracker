from django.conf.urls import include, url
from django.contrib import admin
import twitter.views as view

urlpatterns = [
    url(r'^search/$', view.SearchView.as_view(), name ='search'),   
    url(r'^submit/$', view.SearchView.as_view(), name ='postsearch'),
]
