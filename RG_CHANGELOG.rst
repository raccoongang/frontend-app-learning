RG Changelog
############

All notable changes to this project will be documented in this file.

The format is based on `Keep a Changelog <https://keepachangelog.com/en/1.0.0/>`_,
and this project adheres to customized Semantic Versioning e.g.: `verawood-rg.1`

[Unreleased]
************

Added:
======
* Apply branding custom fonts loading for updates block in course outline (TEA-289)
* Mirror the active dark theme inside the course-outline welcome/handouts iframe via the shared ``theme-variant`` cookie (ENG-63)

Removed:
========
* codecov CI action, and the ``coverage`` job left with nothing to do — the fork has no codecov project, so the step failed every run (VERA-6)
