/* @ds-bundle: {"format":4,"namespace":"SEOCustomerFinderDesignSystem_11a3f8","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"AvatarGroup","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"SearchField","sourcePath":"components/core/SearchField.jsx"},{"name":"ProgressGauge","sourcePath":"components/dashboard/ProgressGauge.jsx"},{"name":"ProjectListItem","sourcePath":"components/dashboard/ProjectListItem.jsx"},{"name":"PromoCard","sourcePath":"components/dashboard/PromoCard.jsx"},{"name":"ReminderCard","sourcePath":"components/dashboard/ReminderCard.jsx"},{"name":"StatCard","sourcePath":"components/dashboard/StatCard.jsx"},{"name":"TeamMemberRow","sourcePath":"components/dashboard/TeamMemberRow.jsx"},{"name":"TimeTracker","sourcePath":"components/dashboard/TimeTracker.jsx"},{"name":"WeeklyBarChart","sourcePath":"components/dashboard/WeeklyBarChart.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"b0a49cf26313","components/core/Badge.jsx":"c51a65c838ae","components/core/Button.jsx":"b580171cf696","components/core/Card.jsx":"4d6cd701ba36","components/core/Icon.jsx":"50fbb94b61b9","components/core/IconButton.jsx":"a509cd11b0b9","components/core/SearchField.jsx":"b1a3c4caabc8","components/dashboard/ProgressGauge.jsx":"c7957f833e2c","components/dashboard/ProjectListItem.jsx":"6cdc9430a998","components/dashboard/PromoCard.jsx":"0fc67235aa02","components/dashboard/ReminderCard.jsx":"639e6654184e","components/dashboard/StatCard.jsx":"0ce02d1f2b9d","components/dashboard/TeamMemberRow.jsx":"c3c908280b36","components/dashboard/TimeTracker.jsx":"34be624ace0f","components/dashboard/WeeklyBarChart.jsx":"7acc07941f5e","components/navigation/NavItem.jsx":"c664adc2bca5","components/navigation/Sidebar.jsx":"69cba17ee5e5","components/navigation/TopBar.jsx":"c463d4c92fb9","ui_kits/app/DashboardScreen.jsx":"161b71d448c8","ui_kits/app/KeywordsScreen.jsx":"005236c751c4","ui_kits/app/LeadsScreen.jsx":"6bf85685330c","ui_kits/app/Shell.jsx":"92e46058385d","ui_kits/app/data.js":"3f7e9bf25378"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SEOCustomerFinderDesignSystem_11a3f8 = window.SEOCustomerFinderDesignSystem_11a3f8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
const RING = {
  none: "none",
  light: "0 0 0 2px var(--sand-0)",
  brand: "0 0 0 2px var(--clay-200)"
};
function Avatar({
  src,
  name = "",
  size = 36,
  ring = "light",
  style
}) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return /*#__PURE__*/React.createElement("span", {
    title: name,
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      flex: "0 0 auto",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--clay-100)",
      color: "var(--clay-700)",
      font: "var(--fw-bold) " + Math.round(size * 0.36) + "px/1 var(--font-sans)",
      boxShadow: RING[ring] || RING.light,
      backgroundImage: src ? "url(" + src + ")" : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      ...style
    }
  }, src ? "" : initials);
}
function AvatarGroup({
  people = [],
  size = 30,
  max = 4
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center"
    }
  }, shown.map((p, i) => /*#__PURE__*/React.createElement(Avatar, {
    key: i,
    name: p.name,
    src: p.src,
    size: size,
    style: {
      marginLeft: i ? -size * 0.3 : 0
    }
  })), rest > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: -size * 0.3,
      width: size,
      height: size,
      borderRadius: "50%",
      background: "var(--sand-200)",
      color: "var(--text-body)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      font: "var(--fw-bold) " + Math.round(size * 0.33) + "px/1 var(--font-sans)",
      boxShadow: "0 0 0 2px var(--sand-0)"
    }
  }, "+", rest));
}
Object.assign(__ds_scope, { Avatar, AvatarGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const TONES = {
  success: {
    bg: "var(--status-success-bg)",
    fg: "var(--status-success-fg)"
  },
  warning: {
    bg: "var(--status-warning-bg)",
    fg: "var(--status-warning-fg)"
  },
  danger: {
    bg: "var(--status-danger-bg)",
    fg: "var(--status-danger-fg)"
  },
  brand: {
    bg: "var(--brand-soft)",
    fg: "var(--clay-700)"
  },
  neutral: {
    bg: "var(--status-neutral-bg)",
    fg: "var(--status-neutral-fg)"
  }
};
function Badge({
  children,
  tone = "neutral",
  shape = "chip",
  dot,
  style
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: t.bg,
      color: t.fg,
      font: "var(--fw-semibold) var(--fs-micro)/1 var(--font-sans)",
      padding: shape === "count" ? "4px 7px" : "5px 9px",
      borderRadius: shape === "pill" ? "var(--radius-pill)" : "var(--radius-chip)",
      ...style
    }
  }, dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "currentColor"
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
const TONES = {
  default: {
    background: "var(--surface-card)",
    color: "var(--text-body)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-card)"
  },
  brand: {
    background: "var(--surface-brand)",
    color: "var(--text-on-brand)",
    border: "1px solid var(--brand)",
    boxShadow: "var(--shadow-brand)"
  },
  dark: {
    background: "var(--surface-inverse)",
    color: "var(--text-on-inverse)",
    border: "1px solid var(--sand-900)",
    boxShadow: "var(--shadow-raised)"
  },
  sunken: {
    background: "var(--surface-sunken)",
    color: "var(--text-body)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "none"
  }
};
function Card({
  children,
  tone = "default",
  title,
  action,
  padding,
  style,
  onClick
}) {
  const t = TONES[tone] || TONES.default;
  return /*#__PURE__*/React.createElement("section", {
    onClick: onClick,
    style: {
      borderRadius: "var(--radius-card)",
      padding: padding != null ? padding : "var(--pad-card)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      ...t,
      ...style
    }
  }, (title || action) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: "var(--type-section-title)",
      letterSpacing: "var(--ls-snug)",
      color: tone === "default" || tone === "sunken" ? "var(--text-strong)" : "inherit"
    }
  }, title), action), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
/** Thin wrapper around the Lucide icon set (loaded from CDN as window.lucide). */
function Icon({
  name,
  size = 18,
  color = "currentColor",
  strokeWidth = 1.9,
  style
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    const draw = () => window.lucide && window.lucide.createIcons({
      attrs: {
        width: size,
        height: size,
        stroke: color,
        "stroke-width": strokeWidth
      }
    });
    if (window.lucide) draw();else {
      const t = setInterval(() => {
        if (window.lucide) {
          draw();
          clearInterval(t);
        }
      }, 60);
      setTimeout(() => clearInterval(t), 4000);
    }
  }, [name, size, color, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      width: size,
      height: size,
      flex: "0 0 auto",
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const SIZES = {
  sm: {
    font: "var(--fs-body-sm)",
    pad: "8px 14px",
    icon: 15,
    gap: 6
  },
  md: {
    font: "var(--fs-body)",
    pad: "var(--pad-control-y) var(--pad-control-x)",
    icon: 17,
    gap: 8
  },
  lg: {
    font: "var(--fs-title)",
    pad: "14px 24px",
    icon: 19,
    gap: 10
  }
};
const VARIANTS = {
  primary: {
    background: "var(--brand)",
    color: "var(--text-on-brand)",
    border: "1px solid var(--brand)",
    boxShadow: "var(--shadow-brand)"
  },
  secondary: {
    background: "var(--surface-card)",
    color: "var(--text-strong)",
    border: "1px solid var(--border-default)",
    boxShadow: "var(--shadow-xs)"
  },
  soft: {
    background: "var(--brand-soft)",
    color: "var(--clay-700)",
    border: "1px solid var(--brand-soft-border)",
    boxShadow: "none"
  },
  ghost: {
    background: "transparent",
    color: "var(--text-body)",
    border: "1px solid transparent",
    boxShadow: "none"
  },
  inverse: {
    background: "var(--clay-600)",
    color: "#fff",
    border: "1px solid var(--clay-600)",
    boxShadow: "none"
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth,
  disabled,
  onClick,
  type = "button",
  style
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const hoverTint = {
    primary: "var(--brand-hover)",
    secondary: "var(--sand-50)",
    soft: "var(--clay-100)",
    ghost: "var(--sand-100)",
    inverse: "var(--clay-700)"
  }[variant];
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? "flex" : "inline-flex",
      width: fullWidth ? "100%" : undefined,
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      font: "var(--fw-semibold) " + s.font + "/1 var(--font-sans)",
      letterSpacing: "var(--ls-snug)",
      padding: s.pad,
      borderRadius: "var(--radius-control)",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "var(--transition-control)",
      whiteSpace: "nowrap",
      ...v,
      background: hover && !disabled ? hoverTint : v.background,
      transform: press && !disabled ? "scale(var(--press-scale))" : "none",
      opacity: disabled ? 0.45 : 1,
      ...style
    }
  }, iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: s.icon
  }) : null, children, iconRight ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
const TONES = {
  plain: {
    background: "var(--surface-card)",
    color: "var(--text-body)",
    border: "1px solid var(--border-subtle)"
  },
  sunken: {
    background: "var(--sand-50)",
    color: "var(--text-body)",
    border: "1px solid transparent"
  },
  outline: {
    background: "transparent",
    color: "var(--text-strong)",
    border: "1px solid var(--border-default)"
  },
  onBrand: {
    background: "rgba(255,255,255,.16)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,.34)"
  },
  brand: {
    background: "var(--brand)",
    color: "#fff",
    border: "1px solid var(--brand)"
  },
  danger: {
    background: "var(--rust-500)",
    color: "#fff",
    border: "1px solid var(--rust-500)"
  }
};
function IconButton({
  icon,
  tone = "plain",
  size = 36,
  label,
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const t = TONES[tone] || TONES.plain;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label || icon,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: size,
      height: size,
      borderRadius: "var(--radius-pill)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "var(--transition-control)",
      ...t,
      filter: hover ? "brightness(.96)" : "none",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(size * 0.47)
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/SearchField.jsx
try { (() => {
function SearchField({
  value,
  onChange,
  placeholder = "Search task",
  shortcut = "⌘ F",
  width = 260,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      width,
      background: "var(--surface-sunken)",
      border: "1px solid " + (focus ? "var(--border-brand)" : "var(--border-subtle)"),
      borderRadius: "var(--radius-field)",
      padding: "9px 12px 9px 14px",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      transition: "var(--transition-control)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 16,
    color: "var(--text-faint)"
  }), /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      font: "var(--type-body)",
      color: "var(--text-strong)"
    }
  }), shortcut ? /*#__PURE__*/React.createElement("kbd", {
    style: {
      font: "var(--fw-medium) var(--fs-micro)/1 var(--font-sans)",
      color: "var(--text-muted)",
      background: "var(--sand-100)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xs)",
      padding: "4px 6px"
    }
  }, shortcut) : null);
}
Object.assign(__ds_scope, { SearchField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SearchField.jsx", error: String((e && e.message) || e) }); }

// components/dashboard/ProgressGauge.jsx
try { (() => {
/** Open-bottom arc gauge with a hatched remainder track. */
function ProgressGauge({
  value = 0,
  label = "Completed",
  size = 200,
  thickness = 26,
  style
}) {
  const r = (size - thickness) / 2;
  const cx = size / 2,
    cy = size / 2;
  const sweep = 250,
    start = 145;
  const pt = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const arc = (from, to) => {
    const [x1, y1] = pt(from),
      [x2, y2] = pt(to);
    return "M " + x1 + " " + y1 + " A " + r + " " + r + " 0 " + (to - from > 180 ? 1 : 0) + " 1 " + x2 + " " + y2;
  };
  const end = start + sweep * value / 100;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: size,
      height: size * 0.78,
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      position: "absolute",
      top: 0,
      left: 0
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("pattern", {
    id: "pg-hatch",
    width: "7",
    height: "7",
    patternTransform: "rotate(45)",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "7",
    fill: "var(--sand-50)"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "7",
    stroke: "var(--sand-200)",
    strokeWidth: "3"
  }))), /*#__PURE__*/React.createElement("path", {
    d: arc(start, start + sweep),
    fill: "none",
    stroke: "url(#pg-hatch)",
    strokeWidth: thickness,
    strokeLinecap: "round"
  }), value > 0 && /*#__PURE__*/React.createElement("path", {
    d: arc(start, end),
    fill: "none",
    stroke: "var(--chart-1)",
    strokeWidth: thickness,
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      paddingTop: size * 0.06
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-extrabold) " + Math.round(size * 0.2) + "px/1 var(--font-display)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--text-strong)"
    }
  }, value, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, label)));
}
Object.assign(__ds_scope, { ProgressGauge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dashboard/ProgressGauge.jsx", error: String((e && e.message) || e) }); }

// components/dashboard/ProjectListItem.jsx
try { (() => {
function ProjectListItem({
  icon = "activity",
  iconTone = "brand",
  title,
  meta,
  right,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    brand: ["var(--clay-100)", "var(--clay-600)"],
    honey: ["var(--honey-100)", "var(--honey-600)"],
    olive: ["var(--olive-100)", "var(--olive-700)"],
    plum: ["var(--plum-100)", "var(--plum-500)"],
    neutral: ["var(--sand-100)", "var(--sand-600)"]
  };
  const [bg, fg] = tones[iconTone] || tones.brand;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "9px 8px",
      borderRadius: "var(--radius-sm)",
      background: hover ? "var(--sand-50)" : "transparent",
      cursor: onClick ? "pointer" : "default",
      transition: "background var(--dur-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: "var(--radius-sm)",
      background: bg,
      color: fg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16,
    color: fg
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-label)",
      color: "var(--text-strong)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, title), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, meta)), right);
}
Object.assign(__ds_scope, { ProjectListItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dashboard/ProjectListItem.jsx", error: String((e && e.message) || e) }); }

// components/dashboard/PromoCard.jsx
try { (() => {
function PromoCard({
  icon = "smartphone",
  title,
  body,
  actionLabel = "Download",
  onAction,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "var(--radius-card)",
      background: "var(--surface-inverse)",
      color: "var(--text-on-inverse)",
      padding: "var(--pad-card)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(110% 80% at 80% 90%, rgba(201,95,54,.38) 0%, rgba(33,26,22,0) 62%)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: "rgba(255,255,255,.14)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      font: "var(--fw-bold) var(--fs-title)/1.25 var(--font-display)",
      letterSpacing: "var(--ls-snug)"
    }
  }, title), body && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      font: "var(--type-caption)",
      color: "rgba(250,246,241,.72)"
    }
  }, body), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "inverse",
    size: "sm",
    fullWidth: true,
    onClick: onAction,
    style: {
      position: "relative",
      marginTop: 6
    }
  }, actionLabel));
}
Object.assign(__ds_scope, { PromoCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dashboard/PromoCard.jsx", error: String((e && e.message) || e) }); }

// components/dashboard/ReminderCard.jsx
try { (() => {
function ReminderCard({
  title,
  time,
  actionLabel = "Start Meeting",
  actionIcon = "video",
  onAction,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-bold) var(--fs-h3)/1.25 var(--font-display)",
      letterSpacing: "var(--ls-snug)",
      color: "var(--text-strong)"
    }
  }, title), time && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)",
      marginTop: 8
    }
  }, time)), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    iconLeft: actionIcon,
    fullWidth: true,
    onClick: onAction
  }, actionLabel));
}
Object.assign(__ds_scope, { ReminderCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dashboard/ReminderCard.jsx", error: String((e && e.message) || e) }); }

// components/dashboard/StatCard.jsx
try { (() => {
function StatCard({
  label,
  value,
  note,
  trend = "up",
  highlight,
  onOpen,
  style
}) {
  const fg = highlight ? "#fff" : "var(--text-strong)";
  const sub = highlight ? "rgba(255,255,255,.82)" : "var(--text-muted)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-card)",
      padding: "var(--pad-card)",
      background: highlight ? "var(--surface-brand)" : "var(--surface-card)",
      border: "1px solid " + (highlight ? "var(--brand)" : "var(--border-subtle)"),
      boxShadow: highlight ? "var(--shadow-brand)" : "var(--shadow-card)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      minWidth: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-semibold) var(--fs-body)/1.3 var(--font-sans)",
      color: fg
    }
  }, label), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "arrow-up-right",
    tone: highlight ? "onBrand" : "outline",
    size: 28,
    label: "Open " + label,
    onClick: onOpen
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-metric)",
      letterSpacing: "var(--ls-tight)",
      color: fg
    }
  }, value), note && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      font: "var(--type-caption)",
      color: sub
    }
  }, trend !== "none" && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: trend === "up" ? "trending-up" : "trending-down",
    size: 14,
    color: highlight ? "rgba(255,255,255,.9)" : "var(--olive-500)"
  }), note));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dashboard/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/dashboard/TeamMemberRow.jsx
try { (() => {
const TONE = {
  Completed: "success",
  "In Progress": "warning",
  Pending: "neutral",
  Blocked: "danger"
};
function TeamMemberRow({
  name,
  src,
  workingOn,
  status,
  prefix = "Working on"
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "9px 4px"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    src: src,
    size: 34,
    ring: "brand"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-label)",
      color: "var(--text-strong)"
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)",
      marginTop: 2,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, prefix, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-body)",
      fontWeight: "var(--fw-semibold)"
    }
  }, workingOn))), status && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: TONE[status] || "neutral"
  }, status));
}
Object.assign(__ds_scope, { TeamMemberRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dashboard/TeamMemberRow.jsx", error: String((e && e.message) || e) }); }

// components/dashboard/TimeTracker.jsx
try { (() => {
const fmt = s => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, "0")).join(":");
function TimeTracker({
  label = "Time Tracker",
  seconds = 0,
  running = false,
  onToggle,
  onStop,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "var(--radius-card)",
      background: "var(--surface-inverse)",
      color: "var(--text-on-inverse)",
      padding: "var(--pad-card-lg)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      boxShadow: "var(--shadow-raised)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(120% 90% at 85% 15%, rgba(201,95,54,.42) 0%, rgba(33,26,22,0) 60%)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      font: "var(--fw-semibold) var(--fs-body)/1 var(--font-sans)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      font: "var(--fw-bold) 36px/1 var(--font-mono)",
      letterSpacing: "0.01em",
      textAlign: "center"
    }
  }, fmt(seconds)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: running ? "pause" : "play",
    tone: "plain",
    size: 40,
    label: running ? "Pause" : "Start",
    onClick: onToggle
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "square",
    tone: "danger",
    size: 40,
    label: "Stop",
    onClick: onStop
  })));
}
Object.assign(__ds_scope, { TimeTracker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dashboard/TimeTracker.jsx", error: String((e && e.message) || e) }); }

// components/dashboard/WeeklyBarChart.jsx
try { (() => {
/** Rounded weekly bars; inactive days render as a hatched ghost. */
function WeeklyBarChart({
  data = [],
  height = 132,
  activeIndex,
  style
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 14,
      height: height + 30,
      ...style
    }
  }, data.map((d, i) => {
    const h = Math.max(24, Math.round(d.value / max * height));
    const active = d.active !== undefined ? d.active : i === activeIndex;
    const solid = ["var(--chart-1)", "var(--chart-2)", "var(--clay-700)"][i % 3];
    return /*#__PURE__*/React.createElement("div", {
      key: d.label + i,
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10
      }
    }, d.tooltip ? /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--fw-bold) var(--fs-micro)/1 var(--font-sans)",
        color: "var(--text-body)",
        background: "var(--sand-0)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xs)",
        padding: "3px 6px",
        boxShadow: "var(--shadow-xs)"
      }
    }, d.tooltip) : /*#__PURE__*/React.createElement("span", {
      style: {
        height: 18
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        height: h,
        borderRadius: "var(--radius-pill)",
        background: active ? solid : "repeating-linear-gradient(135deg,var(--sand-200) 0 3px,var(--sand-50) 3px 7px)",
        transition: "height var(--dur-slow) var(--ease-out)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, d.label));
  }));
}
Object.assign(__ds_scope, { WeeklyBarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dashboard/WeeklyBarChart.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
function NavItem({
  icon,
  label,
  active,
  count,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 11,
      width: "100%",
      padding: "9px 10px 9px 14px",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      borderRadius: "var(--radius-sm)",
      background: active ? "var(--brand-soft)" : hover ? "var(--sand-100)" : "transparent",
      color: active ? "var(--clay-700)" : "var(--text-muted)",
      font: (active ? "var(--fw-bold)" : "var(--fw-medium)") + " var(--fs-body)/1 var(--font-sans)",
      transition: "var(--transition-control)"
    }
  }, active && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: -10,
      top: 6,
      bottom: 6,
      width: 4,
      borderRadius: "var(--radius-pill)",
      background: "var(--brand)"
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18,
    strokeWidth: active ? 2.2 : 1.8
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, label), count ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "brand",
    shape: "count"
  }, count) : null);
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
function Sidebar({
  brand = "SEO Customer Finder",
  sections = [],
  activeId,
  onNavigate,
  footer,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      width: "var(--sidebar-w)",
      flex: "0 0 var(--sidebar-w)",
      background: "var(--surface-card)",
      borderRight: "1px solid var(--border-subtle)",
      padding: "var(--space-6) var(--space-5)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "0 4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: "var(--brand)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      font: "var(--fw-extrabold) 13px/1 var(--font-sans)"
    }
  }, "S"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-extrabold) 15px/1.15 var(--font-display)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--text-strong)"
    }
  }, brand)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)",
      flex: 1
    }
  }, sections.map(sec => /*#__PURE__*/React.createElement("div", {
    key: sec.label,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase",
      color: "var(--text-faint)",
      padding: "0 0 8px 14px"
    }
  }, sec.label), sec.items.map(it => /*#__PURE__*/React.createElement(__ds_scope.NavItem, {
    key: it.id,
    icon: it.icon,
    label: it.label,
    count: it.count,
    active: activeId === it.id,
    onClick: () => onNavigate && onNavigate(it.id)
  }))))), footer);
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function TopBar({
  query,
  onQueryChange,
  user,
  actions = ["mail", "bell"],
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: "var(--topbar-h)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-5)",
      padding: "0 var(--space-6)",
      background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-subtle)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.SearchField, {
    value: query,
    onChange: onQueryChange,
    width: 250
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)"
    }
  }, actions.map(a => /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    key: a,
    icon: a,
    tone: "sunken",
    size: 36
  })), user && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      paddingLeft: 6
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: user.name,
    src: user.src,
    size: 36,
    ring: "brand"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-label)",
      color: "var(--text-strong)"
    }
  }, user.name), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, user.email)))));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/DashboardScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Card,
  Button,
  Badge,
  StatCard,
  WeeklyBarChart,
  ProgressGauge,
  ProjectListItem,
  TeamMemberRow,
  ReminderCard,
  TimeTracker
} = window.SEOCustomerFinderDesignSystem_11a3f8;
function DashboardScreen() {
  const [seconds, setSeconds] = React.useState(5048);
  const [running, setRunning] = React.useState(true);
  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const d = window.SCFData;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Dashboard",
    subtitle: "Track keywords, win customers, and keep every campaign moving.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: "plus"
    }, "Add Campaign"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "Import Data"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Tracked Keywords",
    value: "24",
    note: "Increased from last month",
    highlight: true
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Ranked Pages",
    value: "10",
    note: "Increased from last month"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Active Leads",
    value: "12",
    note: "Increased from last month"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Pending Outreach",
    value: "2",
    note: "On discuss",
    trend: "none"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.5fr 1fr 1fr",
      gap: "var(--gap-grid)",
      marginTop: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Search Visibility",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "This week")
  }, /*#__PURE__*/React.createElement(WeeklyBarChart, {
    data: d.week,
    height: 124
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Reminders"
  }, /*#__PURE__*/React.createElement(ReminderCard, {
    title: "Meeting with Arc Company",
    time: "Time : 02.00 pm - 04.00 pm"
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Pipeline",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "soft",
      size: "sm",
      iconLeft: "plus"
    }, "New"),
    style: {
      gap: 4
    }
  }, d.pipeline.map(p => /*#__PURE__*/React.createElement(ProjectListItem, _extends({
    key: p.title
  }, p))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.5fr 1fr 1fr",
      gap: "var(--gap-grid)",
      marginTop: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Team Collaboration",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "soft",
      size: "sm",
      iconLeft: "plus"
    }, "Add Member"),
    style: {
      gap: 2
    }
  }, d.team.map(m => /*#__PURE__*/React.createElement(TeamMemberRow, _extends({
    key: m.name
  }, m)))), /*#__PURE__*/React.createElement(Card, {
    title: "Campaign Progress",
    style: {
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(ProgressGauge, {
    value: 41,
    label: "Campaign Ended",
    size: 196
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    dot: true
  }, "Completed"), /*#__PURE__*/React.createElement(Badge, {
    tone: "warning",
    dot: true
  }, "In Progress"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    dot: true
  }, "Pending"))), /*#__PURE__*/React.createElement(TimeTracker, {
    seconds: seconds,
    running: running,
    onToggle: () => setRunning(r => !r),
    onStop: () => {
      setRunning(false);
      setSeconds(0);
    }
  })));
}
Object.assign(window, {
  DashboardScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/KeywordsScreen.jsx
try { (() => {
const {
  Card,
  Button,
  Badge,
  SearchField,
  IconButton,
  StatCard
} = window.SEOCustomerFinderDesignSystem_11a3f8;
function Th({
  children,
  align
}) {
  return /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: align || "left",
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase",
      color: "var(--text-faint)",
      padding: "0 12px 12px",
      whiteSpace: "nowrap"
    }
  }, children);
}
function Td({
  children,
  align,
  style
}) {
  return /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: align || "left",
      font: "var(--type-body)",
      color: "var(--text-body)",
      padding: "13px 12px",
      borderTop: "1px solid var(--border-subtle)",
      ...style
    }
  }, children);
}
function KeywordsScreen() {
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(null);
  const rows = window.SCFData.keywords.filter(k => k.term.toLowerCase().includes(q.toLowerCase()));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Keywords",
    subtitle: "Every term you rank for, and the customers it brings in.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: "plus"
    }, "Add Keyword"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: "download"
    }, "Export"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--gap-grid)",
      marginBottom: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Avg. Position",
    value: "7.8",
    note: "Improved from last month",
    highlight: true
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Top 3 Rankings",
    value: "6",
    note: "Increased from last month"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Monthly Clicks",
    value: "3.2k",
    note: "Increased from last month"
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Tracked terms",
    action: /*#__PURE__*/React.createElement(SearchField, {
      value: q,
      onChange: setQ,
      placeholder: "Filter keywords",
      shortcut: "",
      width: 230
    })
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement(Th, null, "Keyword"), /*#__PURE__*/React.createElement(Th, {
    align: "right"
  }, "Volume"), /*#__PURE__*/React.createElement(Th, {
    align: "right"
  }, "Position"), /*#__PURE__*/React.createElement(Th, {
    align: "right"
  }, "Change"), /*#__PURE__*/React.createElement(Th, null, "Intent"), /*#__PURE__*/React.createElement(Th, null, "Status"), /*#__PURE__*/React.createElement(Th, null))), /*#__PURE__*/React.createElement("tbody", null, rows.map(k => /*#__PURE__*/React.createElement("tr", {
    key: k.term,
    onClick: () => setSel(sel === k.term ? null : k.term),
    style: {
      cursor: "pointer",
      background: sel === k.term ? "var(--brand-soft)" : "transparent",
      transition: "background var(--dur-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement(Td, {
    style: {
      font: "var(--type-label)",
      color: "var(--text-strong)"
    }
  }, k.term), /*#__PURE__*/React.createElement(Td, {
    align: "right"
  }, k.volume), /*#__PURE__*/React.createElement(Td, {
    align: "right",
    style: {
      font: "var(--fw-bold) var(--fs-body)/1.4 var(--font-sans)",
      color: "var(--text-strong)"
    }
  }, "#", k.pos), /*#__PURE__*/React.createElement(Td, {
    align: "right",
    style: {
      color: k.change.startsWith("+") ? "var(--olive-500)" : k.change.startsWith("-") ? "var(--rust-500)" : "var(--text-muted)",
      fontWeight: 600
    }
  }, k.change), /*#__PURE__*/React.createElement(Td, null, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, k.intent)), /*#__PURE__*/React.createElement(Td, null, /*#__PURE__*/React.createElement(Badge, {
    tone: {
      Completed: "success",
      "In Progress": "warning",
      Pending: "neutral"
    }[k.status]
  }, k.status)), /*#__PURE__*/React.createElement(Td, {
    align: "right"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "arrow-up-right",
    tone: "outline",
    size: 28
  })))), !rows.length && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement(Td, {
    colSpan: 7,
    style: {
      color: "var(--text-muted)",
      textAlign: "center",
      padding: 32
    }
  }, "No keywords match \u201C", q, "\u201D."))))));
}
Object.assign(window, {
  KeywordsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/KeywordsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/LeadsScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Card,
  Button,
  Badge,
  Avatar,
  ProjectListItem,
  ProgressGauge,
  IconButton,
  ReminderCard
} = window.SEOCustomerFinderDesignSystem_11a3f8;
const STAGES = ["Pending", "In Progress", "Completed"];
const TONE = {
  Completed: "success",
  "In Progress": "warning",
  Pending: "neutral",
  Blocked: "danger"
};
function LeadsScreen() {
  const [leads, setLeads] = React.useState(window.SCFData.leads);
  const advance = name => setLeads(ls => ls.map(l => {
    if (l.name !== name || l.stage === "Blocked") return l;
    const i = STAGES.indexOf(l.stage);
    return {
      ...l,
      stage: STAGES[Math.min(i + 1, STAGES.length - 1)]
    };
  }));
  const won = leads.filter(l => l.stage === "Completed").length;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Leads",
    subtitle: "Customers that found you through search. Click a card to move it forward.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: "user-plus"
    }, "Add Lead"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "Import Data"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: "var(--gap-grid)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--gap-grid)"
    }
  }, leads.map(l => /*#__PURE__*/React.createElement(Card, {
    key: l.name,
    onClick: () => advance(l.name),
    style: {
      cursor: "pointer",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: l.contact,
    size: 34,
    ring: "brand"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-label)",
      color: "var(--text-strong)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, l.name), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, l.contact))), /*#__PURE__*/React.createElement(Badge, {
    tone: TONE[l.stage]
  }, l.stage)), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-extrabold) var(--fs-h2)/1 var(--font-display)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--text-strong)"
    }
  }, l.value), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, "Found via ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-link)",
      fontWeight: 600
    }
  }, l.source))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-grid)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Win rate",
    style: {
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(ProgressGauge, {
    value: Math.round(won / leads.length * 100),
    label: "Closed won",
    size: 186
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Next up",
    action: /*#__PURE__*/React.createElement(IconButton, {
      icon: "more-horizontal",
      tone: "sunken",
      size: 30
    })
  }, /*#__PURE__*/React.createElement(ReminderCard, {
    title: "Meeting with Arc Company",
    time: "Time : 02.00 pm - 04.00 pm",
    actionLabel: "Start Meeting"
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Recent activity",
    style: {
      gap: 2
    }
  }, window.SCFData.pipeline.slice(0, 3).map(p => /*#__PURE__*/React.createElement(ProjectListItem, _extends({
    key: p.title
  }, p)))))));
}
Object.assign(window, {
  LeadsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/LeadsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Shell.jsx
try { (() => {
const {
  Sidebar,
  TopBar,
  PromoCard
} = window.SEOCustomerFinderDesignSystem_11a3f8;
function PageHeader({
  title,
  subtitle,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-6)",
      marginBottom: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: "var(--type-page-title)",
      letterSpacing: "var(--ls-tight)",
      color: "var(--text-strong)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      font: "var(--type-body)",
      color: "var(--text-muted)"
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)"
    }
  }, actions));
}
function Shell({
  active,
  onNavigate,
  query,
  onQueryChange,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-app)",
      minHeight: "100vh",
      padding: "var(--space-6)",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto",
      background: "var(--surface-card)",
      borderRadius: "var(--radius-shell)",
      boxShadow: "var(--shadow-raised)",
      overflow: "hidden",
      display: "flex",
      minHeight: 780
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    sections: window.SCFData.sections,
    activeId: active,
    onNavigate: onNavigate,
    footer: /*#__PURE__*/React.createElement(PromoCard, {
      title: "Download our Mobile App",
      body: "Get easy in another way",
      actionLabel: "Download"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    query: query,
    onQueryChange: onQueryChange,
    user: window.SCFData.user
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      background: "var(--bg-canvas)",
      padding: "var(--space-6)",
      overflow: "auto"
    }
  }, children))));
}
Object.assign(window, {
  Shell,
  PageHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
window.SCFData = {
  user: {
    name: "Totok Michael",
    email: "tmichael20@mail.com"
  },
  sections: [{
    label: "Menu",
    items: [{
      id: "dashboard",
      icon: "layout-grid",
      label: "Dashboard"
    }, {
      id: "keywords",
      icon: "search",
      label: "Keywords",
      count: "12+"
    }, {
      id: "leads",
      icon: "users",
      label: "Leads"
    }, {
      id: "reports",
      icon: "bar-chart-3",
      label: "Reports"
    }, {
      id: "team",
      icon: "user-round",
      label: "Team"
    }]
  }, {
    label: "General",
    items: [{
      id: "settings",
      icon: "settings",
      label: "Settings"
    }, {
      id: "help",
      icon: "help-circle",
      label: "Help"
    }, {
      id: "logout",
      icon: "log-out",
      label: "Logout"
    }]
  }],
  week: [{
    label: "S",
    value: 34
  }, {
    label: "M",
    value: 88,
    active: true
  }, {
    label: "T",
    value: 62,
    active: true
  }, {
    label: "W",
    value: 104,
    active: true,
    tooltip: "74%"
  }, {
    label: "T",
    value: 44
  }, {
    label: "F",
    value: 58
  }, {
    label: "S",
    value: 30
  }],
  pipeline: [{
    icon: "search",
    iconTone: "brand",
    title: "Long-tail keyword audit",
    meta: "Due date: Nov 26, 2024"
  }, {
    icon: "link",
    iconTone: "olive",
    title: "Competitor backlink map",
    meta: "Due date: Nov 28, 2024"
  }, {
    icon: "file-text",
    iconTone: "honey",
    title: "Landing page rewrite",
    meta: "Due date: Nov 30, 2024"
  }, {
    icon: "gauge",
    iconTone: "plum",
    title: "Core Web Vitals fixes",
    meta: "Due date: Dec 5, 2024"
  }, {
    icon: "map-pin",
    iconTone: "neutral",
    title: "Local pack outreach",
    meta: "Due date: Dec 6, 2024"
  }],
  team: [{
    name: "Alexandra Deff",
    workingOn: "Competitor backlink map",
    status: "Completed"
  }, {
    name: "Edwin Adenike",
    workingOn: "Landing page rewrite",
    status: "In Progress"
  }, {
    name: "Isaac Oluwatemilorun",
    workingOn: "Long-tail keyword audit",
    status: "Pending"
  }, {
    name: "David Oshodi",
    workingOn: "Core Web Vitals fixes",
    status: "In Progress"
  }],
  keywords: [{
    term: "seo agency for dentists",
    volume: "2,400",
    pos: 3,
    change: "+4",
    intent: "Commercial",
    status: "Completed"
  }, {
    term: "local seo pricing",
    volume: "1,900",
    pos: 7,
    change: "+1",
    intent: "Commercial",
    status: "In Progress"
  }, {
    term: "how to rank on google maps",
    volume: "8,100",
    pos: 12,
    change: "-2",
    intent: "Informational",
    status: "In Progress"
  }, {
    term: "b2b lead generation seo",
    volume: "1,300",
    pos: 5,
    change: "+9",
    intent: "Commercial",
    status: "Completed"
  }, {
    term: "technical seo checklist",
    volume: "4,400",
    pos: 18,
    change: "0",
    intent: "Informational",
    status: "Pending"
  }, {
    term: "hire seo consultant",
    volume: "990",
    pos: 2,
    change: "+3",
    intent: "Transactional",
    status: "Completed"
  }],
  leads: [{
    name: "Arc Company",
    contact: "Marta Roselle",
    source: "seo agency for dentists",
    value: "$12,400",
    stage: "In Progress"
  }, {
    name: "Northwind Dental",
    contact: "Ben Okafor",
    source: "local seo pricing",
    value: "$8,200",
    stage: "Completed"
  }, {
    name: "Halden & Co",
    contact: "Priya Nair",
    source: "b2b lead generation seo",
    value: "$21,000",
    stage: "Pending"
  }, {
    name: "Ridgeway Clinic",
    contact: "Tom Beecher",
    source: "how to rank on google maps",
    value: "$6,750",
    stage: "In Progress"
  }, {
    name: "Solace Studio",
    contact: "Ana Ferreira",
    source: "hire seo consultant",
    value: "$4,300",
    stage: "Blocked"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarGroup = __ds_scope.AvatarGroup;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SearchField = __ds_scope.SearchField;

__ds_ns.ProgressGauge = __ds_scope.ProgressGauge;

__ds_ns.ProjectListItem = __ds_scope.ProjectListItem;

__ds_ns.PromoCard = __ds_scope.PromoCard;

__ds_ns.ReminderCard = __ds_scope.ReminderCard;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.TeamMemberRow = __ds_scope.TeamMemberRow;

__ds_ns.TimeTracker = __ds_scope.TimeTracker;

__ds_ns.WeeklyBarChart = __ds_scope.WeeklyBarChart;

__ds_ns.NavItem = __ds_scope.NavItem;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
