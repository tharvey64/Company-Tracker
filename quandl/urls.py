from django.conf.urls import include, url,patterns
import quandl.views as view

urlpatterns = patterns('',
        url(r'^stock_history/$', view.QuandlHistoryView.as_view(), name='history'),
        url(r'^today/$', view.IntraDayView.as_view(), name='intra-day'),
        url(r'^current/$', view.FullRangeView.as_view(), name='full-range'),
)