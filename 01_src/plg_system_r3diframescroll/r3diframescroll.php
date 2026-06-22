<?php
/**
 * @package     plg_system_r3diframescroll
 * @version     1.1.0
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

        if ((int) $this->params->get('enabled_on_frontend', 1) !== 1) {
            return;
        }

        $body = $app->getBody();

        $scriptUrl = Uri::root(true) . '/media/plg_system_r3diframescroll/js/r3diframescroll.js?v=1.1.0';
        $marker = $scriptUrl;

        if (strpos($body, $marker) !== false) {
            return;
        }

        $allowedOrigins = preg_split('/[\r\n,]+/', (string) $this->params->get('allowed_message_origins', '')) ?: [];
        $allowedOrigins = array_values(
            array_filter(
                array_map(
                    static fn(string $value): string => trim($value),
                    $allowedOrigins
                ),
                static fn(string $value): bool => $value !== ''
            )
        );

        $config = [
            'selector' => (string) $this->params->get(
                'iframe_selector',
                'iframe[src*="edoobox.com"], iframe[id^="edoobox_"], iframe[name^="edooboxFrame_"]'
            ),
            'storageKey' => (string) $this->params->get('storage_key', 'r3d_iframescroll_target'),
            'scrollOffset' => max(0, (int) $this->params->get('scroll_offset', 80)),
            'scrollDelay' => max(0, (int) $this->params->get('scroll_delay', 500)),
            'smoothScroll' => (bool) $this->params->get('smooth_scroll', 1),
            'requireUserInteraction' => (bool) $this->params->get('require_user_interaction', 1),
            'restoreAfterPageReload' => (bool) $this->params->get('restore_after_page_reload', 1),
            'scrollOnIframeLoad' => (bool) $this->params->get('scroll_on_iframe_load', 1),
            'listenPostmessage' => (bool) $this->params->get('listen_postmessage', 0),
            'allowedMessageOrigins' => $allowedOrigins,
            'yoothemeMode' => (string) $this->params->get('yootheme_mode', 'auto'),
            'debug' => (bool) $this->params->get('debug', 0),
            'pageUrl' => Uri::getInstance()->toString(['path', 'query']),
        ];

        $jsonOptions = json_encode(
            $config,
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT
        );

        $script = '<script>'
            . 'window.R3dIframeScrollConfig=' . $jsonOptions . ';'
            . 'if(window.Joomla&&typeof window.Joomla.loadOptions==="function"){window.Joomla.loadOptions({"plg_system_r3diframescroll":window.R3dIframeScrollConfig});}'
            . '</script>' . "\n"
            . '<script src="' . $scriptUrl . '" defer></script>';

        if (stripos($body, '</head>') !== false) {
            $body = str_ireplace('</head>', $script . "\n</head>", $body);
        } else {
            $body .= "\n" . $script;
        }

        $app->setBody($body);
    }
}
