from django.conf.urls import include, url,patterns
import quandl.views as view

urlpatterns = patterns('',
        url(r'^stock_history/$', view.QuandlHistoryView.as_view(), name='history'),
        url(r'^current/$', view.IntraDayView.as_view(), name='intra-day'),
        # url(r'^company/(?P<symbol>[a-zA-Z\s]+)/$', view.CompanyView.as_view(), name='company-view'),
        # url(r'^add_company/(?P<symbol>[a-zA-Z\s]+)?$', view.CreateCompanyView.as_view(), name='company-create'),
)