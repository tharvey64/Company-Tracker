from django.conf.urls import include, url,patterns
import quandl.views as view

urlpatterns = patterns('',
        url(r'^stock_history/(?P<symbol>[a-zA-Z\s]+)/(?P<date_string>[a-zA-Z0-9-]+)$', view.QuandlHistoryView.as_view(), name='history'),
        url(r'^company/(?P<symbol>[a-zA-Z\s]+)/$', view.CompanyView.as_view(), name='company-view'),
        url(r'^add_company/(?P<symbol>[a-zA-Z]+)?$', view.CreateCompanyView.as_view(), name='company-create'),
)