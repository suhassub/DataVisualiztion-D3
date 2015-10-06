from django.conf.urls import patterns, url

from D3 import views

urlpatterns = patterns('',
        url(r'^$', views.home, name='home'),
        url(r'^visual/', views.visual, name='visual'),
        url(r'^d3/', views.d3_visual, name='d3_visual'),
        url(r'^banana/', views.banana_visual, name='banana_visual'),
        url(r'^facetview/', views.facetview_visual, name='facetview_visual')
)
