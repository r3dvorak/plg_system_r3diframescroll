<?php
/**
 * @package     plg_system_r3diframescroll
 * @version     1.0.3
 * @author      Richard Dvorak <info@r3d.de>
 * @copyright   2026 Richard Dvorak
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Plugin\System\R3diframescroll\Extension\R3dIframeScroll;

require_once __DIR__ . '/src/Extension/R3dIframeScroll.php';

class PlgSystemR3diframescroll extends CMSPlugin
{
    protected $autoloadLanguage = true;

    public function onBeforeCompileHead(): void
    {
        R3dIframeScroll::loadFrontendAssets($this);
    }
}
