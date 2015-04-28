"""
<<<<<<< HEAD
WSGI config for tracker_project project.
=======
WSGI config for tracker project.
>>>>>>> master

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tracker_project.settings")

application = get_wsgi_application()
