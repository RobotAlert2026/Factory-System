export const CATEGORIES = ['Maintenance','Production','Logistics','Quality','Improvement','Planning','Safety','Other'];
export const COLORS = ['#f5a623','#2dd4e8','#34d399','#a78bfa','#f472b6','#fb923c'];
export const ICON_NAMES = ['hanger','bulb','robot','agv','clock','gear','box','tool'];

export const DEFAULT_DESCRIPTIONS = {
  hanger: {
    th:'ตรวจสอบและบำรุงรักษาระบบแขวน PC',
    en:'Inspect and maintain the PC hanger system.',
    zh:'检查并维护 PC 吊挂系统。'
  },
  kaizen: {
    th:'ติดตามโครงการปรับปรุงและ ROI',
    en:'Track improvement projects and ROI.',
    zh:'跟踪改善项目及投资回报率。'
  },
  glue: {
    th:'บันทึก PM ถังกาวและไลน์โรบอท',
    en:'Record glue tank and robot line maintenance.',
    zh:'记录胶水罐及机器人生产线的维护。'
  },
  agv: {
    th:'ตรวจสอบสถานะและ PM รถ AGV',
    en:'Monitor AGV status and maintenance.',
    zh:'查看 AGV 状态并记录维护。'
  },
  downtime: {
    th:'บันทึกและวิเคราะห์ Downtime สายการผลิต',
    en:'Record and analyze production line downtime.',
    zh:'记录并分析生产线停机时间。'
  },
  WareHouse: {
    th:'คลังอะไหล่และระบบเบิกอะไหล่',
    en:'Spare parts inventory and requisition system.',
    zh:'备件库存与领用系统。'
  },
  'Spare Part list': {
    th:'ข้อมูลเครื่องจักรและอะไหล่',
    en:'Machine and spare parts information.',
    zh:'设备与备件信息。'
  }
};

const MAX_LINKS = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const ALLOWED_LINK_FIELDS = new Set(['id','nameTh','nameEn','desc','url','icon','color','category','status','descTh','descEn','descZh']);

export function normalizeLinks(items) {
  if (!Array.isArray(items) || items.length > MAX_LINKS) {
    throw new Error('badCloudLinks');
  }

  const ids = new Set();
  return items.map(link => {
    if (!link || typeof link !== 'object' || Array.isArray(link) ||
      Object.keys(link).some(key => !ALLOWED_LINK_FIELDS.has(key)) ||
      typeof link.id !== 'string' || !link.id.trim() || link.id.length > 128 ||
      typeof link.nameTh !== 'string' || !link.nameTh.trim() || link.nameTh.length > 120 ||
      typeof link.nameEn !== 'string' || !link.nameEn.trim() || link.nameEn.length > 120 ||
      typeof link.url !== 'string' || link.url.length > 2048 ||
      typeof link.color !== 'string' ||
      typeof link.icon !== 'string' ||
      (link.desc !== undefined && typeof link.desc !== 'string') ||
      (link.descTh !== undefined && typeof link.descTh !== 'string') ||
      (link.descEn !== undefined && typeof link.descEn !== 'string') ||
      (link.descZh !== undefined && typeof link.descZh !== 'string')) {
      throw new Error('badLinkFields');
    }

    if (ids.has(link.id)) throw new Error('duplicateLinkId');
    ids.add(link.id);

    let url;
    try {
      url = new URL(link.url);
    } catch {
      throw new Error('badUrl');
    }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('badUrl');

    const descriptions = DEFAULT_DESCRIPTIONS[link.id];
    const descTh = link.descTh ?? link.desc ?? descriptions?.th ?? '';
    const hasCustomLegacyDescription = typeof (link.descTh ?? link.desc) === 'string' &&
      (link.descTh ?? link.desc) !== descriptions?.th;
    if (descTh.length > MAX_DESCRIPTION_LENGTH ||
      (link.descEn ?? (hasCustomLegacyDescription ? descTh : descriptions?.en ?? descTh)).length > MAX_DESCRIPTION_LENGTH ||
      (link.descZh ?? (hasCustomLegacyDescription ? descTh : descriptions?.zh ?? descTh)).length > MAX_DESCRIPTION_LENGTH) {
      throw new Error('descriptionTooLong');
    }
    if (link.status !== undefined && !['online','offline'].includes(link.status)) {
      throw new Error('badStatus');
    }
    if (link.category !== undefined && !CATEGORIES.includes(link.category)) {
      throw new Error('badCategory');
    }
    if (!ICON_NAMES.includes(link.icon)) throw new Error('badIcon');

    return {
      ...link,
      desc: descTh,
      descTh,
      descEn: link.descEn ?? (hasCustomLegacyDescription ? descTh : descriptions?.en ?? descTh),
      descZh: link.descZh ?? (hasCustomLegacyDescription ? descTh : descriptions?.zh ?? descTh),
      color: COLORS.includes(link.color) ? link.color : COLORS[0],
      category: link.category ?? 'Other',
      status: link.status ?? 'online'
    };
  });
}

export function localizedDescription(link, language) {
  const descriptions = {
    th: link.descTh ?? link.desc ?? '',
    en: link.descEn ?? link.descTh ?? link.desc ?? '',
    zh: link.descZh ?? link.descTh ?? link.desc ?? ''
  };
  return descriptions[language] || descriptions.th;
}
