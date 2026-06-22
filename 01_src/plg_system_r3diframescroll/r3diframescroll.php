<?php
/**
 * @package     plg_system_r3diframescroll
 * @version     1.0.9
 * @author      Richard Dvorak <info@r3d.de>
 * @copyright   2026 Richard Dvorak
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Uri\Uri;

class PlgSystemR3diframescroll extends CMSPlugin
{
    public function onAfterRender()
    {
        $app = Factory::getApplication();

        if (!$app->isClient('site')) {
            return;
        }

        $body = $app->getBody();

        $marker = '<!-- R3D Iframe Scroll HARD TEST 1.0.9 -->';

        if (strpos($body, $marker) !== false) {
            return;
        }

        $script = $marker . "\n"
            . '<script src="' . Uri::root(true) . '/media/plg_system_r3diframescroll/js/r3diframescroll.js?v=1.0.9" defer></script>';

        if (stripos($body, '</head>') !== false) {
            $body = str_ireplace('</head>', $script . "\n</head>", $body);
        } else {
            $body .= "\n" . $script;
        }

        $app->setBody($body);
    }
}
