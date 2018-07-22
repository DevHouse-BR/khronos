#!/bin/bash
php -c /home/devhouse/public_html/showcase/khronos/php.ini /home/devhouse/public_html/showcase/khronos/drop-tables.php
php -c /home/devhouse/public_html/showcase/khronos/php.ini /home/devhouse/public_html/showcase/khronos/doctrine-cli build-all-reload --no-confirmation
php -c /home/devhouse/public_html/showcase/khronos/php.ini /home/devhouse/public_html/showcase/khronos/doctrine.php