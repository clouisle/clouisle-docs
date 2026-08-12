'use client';

import { useEffect } from 'react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';

/** 客户端导航时 [lang] 段重渲染，但 html 标签在根 layout，需手动同步 lang */
export function SyncHtmlLang() {
  const { locale } = useI18n();

  useEffect(() => {
    if (locale) document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
