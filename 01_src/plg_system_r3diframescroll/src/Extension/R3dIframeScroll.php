<?php
/**
 * @package     plg_system_r3diframescroll
 * @version     1.0.3
 * @author      Richard Dvorak <info@r3d.de>
 * @copyright   2026 Richard Dvorak
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Plugin\System\R3diframescroll\Extension;

defined('_JEXEC') or die;

use Joomla\CMS\Application\CMSApplicationInterface;
use Joomla\CMS\Document\HtmlDocument;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Uri\Uri;

final class R3dIframeScroll extends CMSPlugin
{
    protected $autoloadLanguage = true;

    public function onBeforeCompileHead(): void
    {
        self::loadFrontendAssets($this);
    }

    public static function loadFrontendAssets(CMSPlugin $plugin): void
    {
        static $alreadyLoaded = false;

        if ($alreadyLoaded) {
            return;
        }

        $app = $plugin->getApplication();

        if (!$app instanceof CMSApplicationInterface || !$app->isClient('site')) {
            return;
        }

        if ((int) $plugin->params->get('enabled_on_frontend', 1) !== 1) {
            return;
        }

        $document = $app->getDocument();

        if (!$document instanceof HtmlDocument) {
            return;
        }

        $allowedOrigins = preg_split('/[\r\n,]+/', (string) $plugin->params->get('allowed_message_origins', '')) ?: [];
        $allowedOrigins = array_values(
            array_filter(
                array_map(
                    static fn(string $value): string => trim($value),
                    $allowedOrigins
                ),
                static fn(string $value): bool => $value !== ''
            )
        );

        $options = [
            'selector' => (string) $plugin->params->get(
                'iframe_selector',
                'iframe[src*="edoobox.com"], iframe[id^="edoobox_"], iframe[name^="edooboxFrame_"]'
            ),
            'storageKey' => (string) $plugin->params->get('storage_key', 'r3d_iframescroll_target'),
            'scrollOffset' => max(0, (int) $plugin->params->get('scroll_offset', 80)),
            'scrollDelay' => max(0, (int) $plugin->params->get('scroll_delay', 500)),
            'smoothScroll' => (bool) $plugin->params->get('smooth_scroll', 1),
            'requireUserInteraction' => (bool) $plugin->params->get('require_user_interaction', 1),
            'restoreAfterPageReload' => (bool) $plugin->params->get('restore_after_page_reload', 1),
            'scrollOnIframeLoad' => (bool) $plugin->params->get('scroll_on_iframe_load', 1),
            'listenPostmessage' => (bool) $plugin->params->get('listen_postmessage', 0),
            'allowedMessageOrigins' => $allowedOrigins,
            'yoothemeMode' => (string) $plugin->params->get('yootheme_mode', 'auto'),
            'debug' => (bool) $plugin->params->get('debug', 0),
            'pageUrl' => Uri::getInstance()->toString(['path', 'query']),
        ];

        $document->addScriptOptions('plg_system_r3diframescroll', $options);
        $document->addScript(
            Uri::root(true) . '/media/plg_system_r3diframescroll/js/r3diframescroll.js',
            [],
            ['defer' => true]
        );

        if ((bool) $plugin->params->get('debug', 0)) {
            $document->addCustomTag('<!-- R3D Iframe Scroll plugin event reached -->');
        }

        $alreadyLoaded = true;
    }
}
