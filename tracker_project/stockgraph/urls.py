from django.conf.urls import include, url
from django.contrib import admin
import stockgraph.views as view


urlpatterns = [
	url(r'^$', view.WelcomeView.as_view(), name='welcome'),
	url(r'lookup/$', view.CompanyView.as_view(), name='search'),
]
