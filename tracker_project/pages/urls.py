from django.conf.urls import url
from django.contrib import admin
import pages.views as view

urlpatterns = [
    url(r'^$', view.IndexView.as_view(), name='index'),
]