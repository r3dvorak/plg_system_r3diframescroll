<?php
/**
 * @package     plg_system_r3diframescroll
 * @version     1.0.6
 * @author      Richard Dvorak <info@r3d.de>
 * @copyright   2026 Richard Dvorak
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Application\CMSApplicationInterface;
use Joomla\CMS\Document\HtmlDocument;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Uri\Uri;

class PlgSystemR3diframescroll extends CMSPlugin
{
    protected $autoloadLanguage = true;

    public function onBeforeCompileHead(): void
    {
        $app = $this->getApplication();

        if (!$app instanceof CMSApplicationInterface || !$app->isClient('site')) {
            return;
        }

        $document = $app->getDocument();

        if (!$document instanceof HtmlDocument) {
            return;
        }

        $document->addCustomTag('<!-- R3D Iframe Scroll HARD TEST -->');

        $document->addScript(
            Uri::root(true) . '/media/plg_system_r3diframescroll/js/r3diframescroll.js',
            [],
            ['defer' => true]
        );
    }
}
