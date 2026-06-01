"""
PitSim-F1 v3.0 — settings.py
Configuration Django du projet.
"""

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-pitsim-f1-dev-key-change-in-production",
)

# Use env var to control debug in dev/prod
DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# `django-cors-headers` is optional for running tests locally; include it only when installed
try:
    import corsheaders  # type: ignore
    INSTALLED_APPS += ["corsheaders"]
    CORS_MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware"]
except Exception:
    CORS_MIDDLEWARE = []
    # Note: when corsheaders is missing, cross-origin requests in dev will not be handled by this middleware.
    
# Ajout des applications du projet (toujours)
INSTALLED_APPS += [
    "core",
    "race",
    "optimizer",
    "ml",
    "clustering",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    # Conditionally insert CORS middleware if available
] + CORS_MIDDLEWARE + [
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True


ROOT_URLCONF = "pitsim_f1.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "pitsim_f1.wsgi.application"

# Base de données SQLite (dev) — passer à PostgreSQL en production
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Internationalisation
LANGUAGE_CODE = "fr-fr"
TIME_ZONE     = "Europe/Paris"
USE_I18N      = True
USE_TZ        = True

# Fichiers statiques
STATIC_URL  = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"

# Durée de session (8h pour usage intensif)
SESSION_COOKIE_AGE = 28800

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
