from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'^sentiment/', include('sentiment.urls', namespace='sentiment')),
    url(r'^twitter/', include('sentiment.urls', namespace='twitter')),
    url(r'^stocks/', include('stocks.urls', namespace='stocks')),
    url(r'^users/', include('users.urls', namespace='users')),
    url(r'^$', include('pages.urls', namespace='pages')),  
    url(r'^admin/', include(admin.site.urls)), 
]
