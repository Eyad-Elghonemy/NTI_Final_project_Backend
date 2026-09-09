import io
import json
from datetime import datetime

import requests
import streamlit as st
from PIL import Image
from fpdf import FPDF

API_BASE_URL = "https://eyadzz-churn-live.hf.space"
DEFAULT_CONF = 0.35

st.set_page_config(
    page_title="CarDD — AI Vehicle Damage Assessment",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ---------------------------------------------------------------------------
# THEME / CSS
# ---------------------------------------------------------------------------
ACCENT = "#ff5a36"
ACCENT_SOFT = "rgba(255, 90, 54, 0.12)"
BG = "#0a0a0b"
PANEL = "#131315"
PANEL_BORDER = "#232326"
TEXT = "#f3f3f2"
SUBTEXT = "#8a8a8f"

st.markdown(f"""
<style>
    .stApp {{
        background: {BG};
        color: {TEXT};
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }}
    #MainMenu, footer, header {{visibility: hidden;}}
    section[data-testid="stSidebar"] {{ display: none !important; }}
    .block-container {{
        padding-top: 1.5rem;
        padding-bottom: 3rem;
        max-width: 1400px;
    }}

    /* ---- top bar ---- */
    .cardd-topbar {{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 4px 18px 4px;
        border-bottom: 1px solid {PANEL_BORDER};
        margin-bottom: 8px;
    }}
    .cardd-brand {{ display: flex; align-items: center; gap: 12px; }}
    .cardd-logo {{
        width: 40px; height: 40px; border-radius: 10px;
        background: {ACCENT_SOFT}; border: 1px solid rgba(255,90,54,0.35);
        display: flex; align-items: center; justify-content: center; font-size: 20px;
    }}
    .cardd-logo svg {{ width: 22px; height: 22px; }}
    .cardd-brand-name {{ font-weight: 700; font-size: 17px; line-height: 1.1; color: {TEXT}; }}
    .cardd-brand-sub {{ font-size: 10.5px; letter-spacing: 0.06em; color: {SUBTEXT}; }}
    .cardd-status {{ display: flex; align-items: center; gap: 8px; font-size: 13px; color: {SUBTEXT}; }}
    .cardd-dot {{ width: 8px; height: 8px; border-radius: 50%; background: #34d17c; box-shadow: 0 0 8px #34d17c; }}
    .cardd-dot-down {{ background: #ff4444; box-shadow: 0 0 8px #ff4444; }}

    /* ---- hero ---- */
    .cardd-eyebrow {{ font-size: 12px; letter-spacing: 0.14em; color: {ACCENT}; font-weight: 600; margin-bottom: 10px; }}
    .cardd-hero h1 {{ font-size: 40px; line-height: 1.12; font-weight: 800; margin: 0 0 12px 0; color: {TEXT}; }}
    .cardd-hero h1 span {{ color: {ACCENT}; }}
    .cardd-hero p {{ color: {SUBTEXT}; font-size: 15px; max-width: 560px; margin-bottom: 6px; }}

    /* ---- tabs ---- */
    .stTabs [data-baseweb="tab-list"] {{
        gap: 4px; border-bottom: 1px solid {PANEL_BORDER}; margin-bottom: 22px;
    }}
    .stTabs [data-baseweb="tab"] {{
        background: transparent; color: {SUBTEXT}; font-weight: 600; font-size: 14.5px;
        padding: 10px 4px; margin-right: 22px; border-radius: 0;
    }}
    .stTabs [aria-selected="true"] {{
        color: {TEXT} !important; border-bottom: 2px solid {ACCENT} !important;
    }}

    /* ---- panel / card ---- */
    .cardd-panel {{
        background: {PANEL}; border: 1px solid {PANEL_BORDER}; border-radius: 14px;
        padding: 20px 22px; margin-bottom: 18px;
    }}
    .cardd-panel-head {{ display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }}
    .cardd-step-num {{
        width: 26px; height: 26px; border-radius: 50%; background: {ACCENT}; color: white;
        font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
    }}
    .cardd-panel-title {{ font-weight: 700; font-size: 16px; color: {TEXT}; }}
    .cardd-panel-sub {{ font-size: 12.5px; color: {SUBTEXT}; margin-left: 38px; margin-bottom: 14px; }}

    /* ---- finding row ---- */
    .cardd-finding {{ display: flex; align-items: center; justify-content: space-between; padding: 12px 4px; border-bottom: 1px solid {PANEL_BORDER}; }}
    .cardd-finding:last-child {{ border-bottom: none; }}
    .cardd-finding-left {{ display: flex; align-items: center; gap: 12px; }}
    .cardd-finding-icon {{
        width: 34px; height: 34px; border-radius: 9px; background: {ACCENT_SOFT};
        display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
    }}
    .cardd-finding-type {{ font-weight: 600; font-size: 14.5px; color: {TEXT}; }}
    .cardd-finding-loc {{ font-size: 12.5px; color: {SUBTEXT}; }}
    .cardd-finding-pct {{ font-weight: 700; font-size: 14.5px; text-align: right; color: {TEXT}; }}

    .badge {{ display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; }}
    .badge svg {{ margin-right: 4px; vertical-align: -2px; }}
    .badge-minor {{ background: rgba(234,179,8,0.15); color: #eab308; }}
    .badge-moderate {{ background: rgba(255,138,61,0.15); color: #ff8a3d; }}
    .badge-severe {{ background: rgba(255,68,68,0.15); color: #ff4444; }}

    /* ---- stat cards ---- */
    .stat-card {{ background: {PANEL}; border: 1px solid {PANEL_BORDER}; border-radius: 14px; padding: 16px 18px; }}
    .stat-label {{ font-size: 11px; letter-spacing: 0.08em; color: {SUBTEXT}; font-weight: 600; margin-bottom: 10px; text-transform: uppercase; }}
    .stat-value {{ font-size: 28px; font-weight: 800; color: {TEXT}; }}
    .stat-sub {{ font-size: 12px; color: {SUBTEXT}; margin-top: 4px; }}

    /* ---- repair steps ---- */
    .step-row {{ display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start; }}
    .step-circle {{
        width: 22px; height: 22px; border-radius: 50%; border: 1px solid {PANEL_BORDER}; color: {SUBTEXT};
        font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; margin-top: 1px;
    }}
    .step-text {{ font-size: 14px; color: {TEXT}; line-height: 1.5; }}
    .tool-row {{ display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 14px; color: {TEXT}; }}
    .tool-check {{ color: #34d17c; font-size: 15px; }}

    .cost-label {{ font-size: 12.5px; color: {SUBTEXT}; margin-bottom: 4px; }}
    .cost-value {{ font-size: 20px; font-weight: 700; color: {TEXT}; }}
    .total-cost-box {{ background: {ACCENT_SOFT}; border: 1px solid rgba(255,90,54,0.35); border-radius: 12px; padding: 14px 18px; }}
    .total-cost-label {{ font-size: 12px; color: {SUBTEXT}; margin-bottom: 4px; }}
    .total-cost-value {{ font-size: 24px; font-weight: 800; color: {ACCENT}; }}

    .notes-box {{ background: #0f0f10; border: 1px solid {PANEL_BORDER}; border-radius: 12px; padding: 14px 16px; font-size: 13.5px; color: {SUBTEXT}; line-height: 1.6; }}

    div.stButton > button {{
        background: {ACCENT}; color: white; border: none; border-radius: 10px;
        padding: 0.6rem 1rem; font-weight: 700; font-size: 15px; transition: opacity 0.15s ease;
    }}
    div.stButton > button:hover {{ opacity: 0.88; color: white; }}

    div.stDownloadButton > button {{
        background: {PANEL}; color: {TEXT}; border: 1px solid {PANEL_BORDER}; border-radius: 10px;
        padding: 0.55rem 1rem; font-weight: 700; font-size: 14px;
    }}
    div.stDownloadButton > button:hover {{ border-color: {ACCENT}; color: {ACCENT}; }}

    [data-testid="stFileUploader"] {{ background: #0f0f10; border: 1px dashed {PANEL_BORDER}; border-radius: 12px; padding: 6px; }}

    .jump-link, a.jump-link, a.jump-link:link, a.jump-link:visited {{
        display: inline-flex !important; align-items: center; gap: 8px;
        color: {ACCENT} !important; text-decoration: none !important;
        font-size: 13.5px; font-weight: 700; border: 1px solid rgba(255,90,54,0.35);
        background: {ACCENT_SOFT}; padding: 9px 16px; border-radius: 8px;
    }}
    a.jump-link:hover {{
        color: {BG} !important; background: {ACCENT} !important; border-color: {ACCENT} !important;
        text-decoration: none !important;
    }}
    a.jump-link svg {{ width: 15px; height: 15px; flex-shrink: 0; }}
    .empty-state {{ text-align: center; padding: 60px 0; color: {SUBTEXT}; font-size: 14px; }}

    .history-card {{
        display: flex; gap: 14px; background: {PANEL}; border: 1px solid {PANEL_BORDER};
        border-radius: 14px; padding: 14px 16px; margin-bottom: 12px; align-items: center;
    }}
    .history-thumb {{ width: 64px; height: 64px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }}
    .history-meta {{ font-size: 12px; color: {SUBTEXT}; }}
    .history-title {{ font-weight: 700; font-size: 14.5px; color: {TEXT}; margin-bottom: 2px; }}
</style>
""", unsafe_allow_html=True)

DAMAGE_ICONS = {
    "dent": "wrench", "scratch": "scratch", "crack": "zap",
    "glass shatter": "droplet", "lamp broken": "bulb-off", "tire flat": "disc",
}
SEVERITY_BADGE = {"minor": "badge-minor", "moderate": "badge-moderate", "severe": "badge-severe"}

# ---------------------------------------------------------------------------
# Inline line-icons (Feather-style, single color via currentColor) so every
# icon on the page matches the brand instead of mismatched emoji.
# ---------------------------------------------------------------------------
_ICON_PATHS = {
    "car": '<path d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M5 17H3v-5l2-5h11l3 5h1a1 1 0 0 1 1 1v4h-2M9 17h6M5 12h13"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    "history": '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 3"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><path d="M12 8h.01"/>',
    "arrow-down": '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    "wrench": '<path d="M14.7 6.3a4 4 0 0 0-5.6 5.6L2 19l3 3 7.1-7.1a4 4 0 0 0 5.6-5.6l-2.8 2.8-2-2z"/>',
    "toolbox": '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><path d="M2 13h20"/>',
    "dollar": '<circle cx="12" cy="12" r="9"/><path d="M12 6v12"/><path d="M15.5 9.5A2.5 2.5 0 0 0 13 8h-2a2.5 2.5 0 0 0 0 5h2a2.5 2.5 0 0 1 0 5h-2a2.5 2.5 0 0 1-2.5-1.5"/>',
    "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6M9 9h1"/>',
    "download": '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    "archive": '<rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>',
    "alert-triangle": '<path d="M10.3 3.9 2.7 17a1.5 1.5 0 0 0 1.3 2.2h16a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z"/><path d="M12 9v4"/><path d="M12 16.5h.01"/>',
    "zap": '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    "scratch": '<path d="M4 20 20 4M9 20 20 9M4 15 15 4"/>',
    "droplet": '<path d="M12 2s6 7.2 6 11.5A6 6 0 0 1 6 13.5C6 9.2 12 2 12 2Z"/>',
    "bulb-off": '<path d="M9 18h6M10 22h4M2 2l20 20"/><path d="M8.5 14A5.5 5.5 0 0 1 12 4.5 5.5 5.5 0 0 1 17.5 10a5.5 5.5 0 0 1-1.6 3.9"/>',
    "disc": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
}


def icon(name: str, size: int = 16, color: str | None = None, stroke_width: float = 2.1) -> str:
    """Returns an inline SVG line-icon, colored via currentColor so it
    inherits the surrounding text color unless `color` is given explicitly."""
    style = f'color:{color};' if color else ""
    path = _ICON_PATHS.get(name, "")
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
        f'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{stroke_width}" '
        f'stroke-linecap="round" stroke-linejoin="round" style="{style}vertical-align:middle;">{path}</svg>'
    )


def badge(severity: str) -> str:
    cls = SEVERITY_BADGE.get(severity.lower(), "badge-moderate")
    return f'<span class="badge {cls}">{severity.title()}</span>'


SEVERITY_RGB = {
    "minor": (234, 179, 8),
    "moderate": (255, 138, 61),
    "severe": (255, 68, 68),
}


def build_pdf(report: dict, findings: list, image_bytes: bytes | None = None,
              source_filename: str = "vehicle.jpg") -> bytes:
    """Builds an organized, easy-to-follow PDF summary of the AI damage report,
    with the annotated detection image at the top so the reader sees the car
    before reading the findings."""
    import os
    import tempfile

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    PAGE_W = 210
    MARGIN = 12
    CONTENT_W = PAGE_W - 2 * MARGIN

    ACCENT_RGB = (255, 90, 54)
    DARK_RGB = (20, 20, 20)
    GREY_RGB = (100, 100, 100)
    LIGHT_BG = (245, 245, 245)

    # ---- Header band ----
    pdf.set_fill_color(20, 20, 22)
    pdf.rect(0, 0, PAGE_W, 26, style="F")
    pdf.set_text_color(*ACCENT_RGB)
    pdf.set_font("Helvetica", "B", 17)
    pdf.set_xy(MARGIN, 6)
    pdf.cell(0, 9, "CarDD - AI Damage Report", ln=True)
    pdf.set_text_color(170, 170, 170)
    pdf.set_font("Helvetica", "", 9.5)
    pdf.set_xy(MARGIN, 15)
    pdf.cell(0, 6, f"Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True)
    pdf.set_y(32)

    def section_title(txt, num=None):
        pdf.ln(3)
        pdf.set_fill_color(*LIGHT_BG)
        label = f"{num}.  {txt}" if num else txt
        pdf.set_text_color(*DARK_RGB)
        pdf.set_font("Helvetica", "B", 12.5)
        pdf.cell(0, 9, label, ln=True, fill=True, border=0, align="L")
        pdf.ln(2)

    def body(txt, size=10.5, color=GREY_RGB):
        pdf.set_text_color(*color)
        pdf.set_font("Helvetica", "", size)
        pdf.multi_cell(0, 5.8, txt)
        pdf.ln(1)

    # ---- 1. Annotated vehicle photo ----
    if image_bytes:
        try:
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                tmp.write(image_bytes)
                tmp_path = tmp.name
            section_title("Analyzed Photo", 1)
            img_w = CONTENT_W
            pdf.image(tmp_path, x=MARGIN, w=img_w)
            os.unlink(tmp_path)
            pdf.set_font("Helvetica", "I", 8.5)
            pdf.set_text_color(*GREY_RGB)
            pdf.cell(0, 6, "Highlighted regions show AI-detected damage.", ln=True)
            pdf.ln(2)
        except Exception:
            pass

    # ---- 2. Summary strip ----
    section_title("Summary", 2)
    tech = report.get("technician_service_cost_egp", {})
    parts = report.get("equipment_and_parts_cost_egp", {})
    total = report.get("total_estimated_cost_egp", {})
    n_damages = len(report.get("damage_assessment", []))

    col_w = CONTENT_W / 3
    stats = [
        ("Damage found", f"{n_damages} region(s)"),
        ("Repair time", f"{report.get('estimated_repair_time_hours', '-')} hrs"),
        ("Total cost", f"{total.get('min','-')}-{total.get('max','-')} EGP"),
    ]
    y0 = pdf.get_y()
    for i, (label, value) in enumerate(stats):
        x = MARGIN + i * col_w
        pdf.set_xy(x, y0)
        pdf.set_draw_color(225, 225, 225)
        pdf.rect(x, y0, col_w - 4, 20)
        pdf.set_xy(x + 3, y0 + 3)
        pdf.set_font("Helvetica", "", 8.5)
        pdf.set_text_color(*GREY_RGB)
        pdf.cell(col_w - 8, 5, label.upper())
        pdf.set_xy(x + 3, y0 + 10)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(*ACCENT_RGB if i == 2 else DARK_RGB)
        pdf.cell(col_w - 8, 6, value)
    pdf.set_y(y0 + 26)

    body(f"Technician cost: {tech.get('min','-')} - {tech.get('max','-')} EGP", size=10, color=(70, 70, 70))
    body(f"Parts & equipment cost: {parts.get('min','-')} - {parts.get('max','-')} EGP", size=10, color=(70, 70, 70))

    # ---- 3. Damage assessment ----
    section_title("Damage Assessment", 3)
    for i, d in enumerate(report.get("damage_assessment", []), 1):
        sev = d.get("severity", "moderate").lower()
        sev_rgb = SEVERITY_RGB.get(sev, (255, 138, 61))

        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(*DARK_RGB)
        pdf.cell(4)
        title = f"{i}. {d['damage_type'].title()}  -  {d['location_on_vehicle']}"
        pdf.cell(pdf.get_string_width(title) + 4, 7, title)

        pdf.set_font("Helvetica", "B", 8.5)
        pdf.set_text_color(*sev_rgb)
        pdf.cell(0, 7, f"  [{sev.upper()}]", ln=True)

        pdf.set_x(MARGIN + 4)
        body(d["description"], size=10, color=(90, 90, 90))

    # ---- 4. Repair plan ----
    if report.get("repair_steps"):
        section_title("Repair Plan", 4)
        for i, step in enumerate(report["repair_steps"], 1):
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*ACCENT_RGB)
            pdf.cell(7, 6, f"{i}.")
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(*DARK_RGB)
            x_after = pdf.get_x()
            pdf.multi_cell(CONTENT_W - (x_after - MARGIN), 6, step)
            pdf.ln(0.5)
        pdf.ln(1)

    # ---- 5. Tools & equipment ----
    if report.get("tools_and_equipment_needed"):
        section_title("Tools & Equipment Needed", 5)
        for tool in report["tools_and_equipment_needed"]:
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(*DARK_RGB)
            pdf.cell(5, 6, chr(149))  # bullet
            pdf.cell(0, 6, tool, ln=True)
        pdf.ln(1)

    # ---- 6. Notes ----
    if report.get("notes"):
        section_title("AI Assessment Notes", 6)
        body(report["notes"], color=(90, 90, 90))

    # ---- Footer disclaimer ----
    pdf.ln(4)
    pdf.set_draw_color(225, 225, 225)
    pdf.line(MARGIN, pdf.get_y(), PAGE_W - MARGIN, pdf.get_y())
    pdf.ln(3)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.multi_cell(0, 5, "This report was generated automatically by an AI vision pipeline "
                         "(YOLOv8-seg + Gemini) and is an estimate for guidance only. "
                         "Always confirm findings and pricing with a qualified technician "
                         "before proceeding with repairs.")

    return bytes(pdf.output(dest="S"))


# ---------------------------------------------------------------------------
# STATE
# ---------------------------------------------------------------------------
if "result" not in st.session_state:
    st.session_state.result = None
if "annotated" not in st.session_state:
    st.session_state.annotated = None
if "history" not in st.session_state:
    st.session_state.history = []

# ---------------------------------------------------------------------------
# TOP BAR
# ---------------------------------------------------------------------------
st.markdown(f"""
<div class="cardd-topbar">
    <div class="cardd-brand">
        <div class="cardd-logo">{icon("car", size=22, color=ACCENT)}</div>
        <div>
            <div class="cardd-brand-name">CarDD</div>
            <div class="cardd-brand-sub">AI VEHICLE DAMAGE ASSESSMENT</div>
        </div>
    </div>
    <div class="cardd-status"><span class="cardd-dot"></span> System Operational</div>
</div>
""", unsafe_allow_html=True)

tab_analyze, tab_history, tab_about = st.tabs([
    ":material/search: Analyze",
    ":material/history: History",
    ":material/info: About",
])

# ===========================================================================
# TAB: ANALYZE
# ===========================================================================
with tab_analyze:
    st.markdown(f"""
    <div class="cardd-hero">
        <div class="cardd-eyebrow">TURN IMAGES INTO INSIGHTS</div>
        <h1>See the damage.<br><span>Know what's next.</span></h1>
        <p>Advanced computer vision for faster, clearer, and more accurate vehicle damage assessment.</p>
    </div>
    """, unsafe_allow_html=True)

    if st.session_state.result and st.session_state.result.get("report"):
        st.markdown(
            f'<a class="jump-link" href="#report-section">{icon("arrow-down", size=15)} Jump to AI Damage Report</a>',
            unsafe_allow_html=True,
        )
        st.markdown("<br><br>", unsafe_allow_html=True)

    col_upload, col_results = st.columns([1, 1.15], gap="medium")

    with col_upload:
        st.markdown("""
        <div class="cardd-panel">
            <div class="cardd-panel-head">
                <div class="cardd-step-num">1</div>
                <div class="cardd-panel-title">Upload Vehicle</div>
            </div>
            <div class="cardd-panel-sub">Upload an image of the damaged vehicle</div>
        """, unsafe_allow_html=True)

        uploaded_file = st.file_uploader(" ", type=["jpg", "jpeg", "png"], label_visibility="collapsed")
        if uploaded_file is not None:
            st.image(uploaded_file, use_container_width=True)

        analyze_clicked = st.button(":material/search: Analyze Image", use_container_width=True, disabled=uploaded_file is None)
        st.markdown("</div>", unsafe_allow_html=True)

    if uploaded_file is not None and analyze_clicked:
        image_bytes = uploaded_file.getvalue()
        with st.spinner("Running detection and generating report..."):
            try:
                files = {"file": (uploaded_file.name, image_bytes, uploaded_file.type)}
                resp = requests.post(f"{API_BASE_URL}/analyze", files=files, timeout=60,
                                      params={"conf": DEFAULT_CONF})
                resp.raise_for_status()
                st.session_state.result = resp.json()

                img_resp = requests.post(f"{API_BASE_URL}/analyze-image",
                                          files={"file": (uploaded_file.name, image_bytes, uploaded_file.type)},
                                          timeout=60)
                img_resp.raise_for_status()
                st.session_state.annotated = img_resp.content

                st.session_state.history.insert(0, {
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "filename": uploaded_file.name,
                    "thumb": image_bytes,
                    "annotated": st.session_state.annotated,
                    "findings": st.session_state.result.get("findings", []),
                    "report": st.session_state.result.get("report"),
                })
                st.toast("Analysis complete", icon="✅")
            except requests.exceptions.RequestException as e:
                st.error(f"Connection error: {e}")
                st.session_state.result = None
            except ValueError:
                st.error("Server returned an invalid response.")
                st.session_state.result = None

    data = st.session_state.result

    with col_results:
        findings = data.get("findings", []) if data else []

        st.markdown(f"""
        <div class="cardd-panel">
            <div class="cardd-panel-head" style="justify-content: space-between;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="cardd-step-num">2</div>
                    <div class="cardd-panel-title">Analysis Results</div>
                </div>
                <div style="font-size:11px; color:{SUBTEXT};">MODEL &middot; CarDD-Vision 1.0</div>
            </div>
            <div class="cardd-panel-sub">AI detection and assessment results</div>
        """, unsafe_allow_html=True)

        if st.session_state.annotated:
            img = Image.open(io.BytesIO(st.session_state.annotated))
            st.image(img, use_container_width=True)
        elif uploaded_file is not None:
            st.image(uploaded_file, use_container_width=True)
        else:
            st.markdown('<div class="empty-state">Upload and analyze a vehicle image to see results here.</div>', unsafe_allow_html=True)

        if findings:
            st.markdown(f'<div style="margin-top:16px; font-weight:700; font-size:14px;">Detected Damage <span style="color:{SUBTEXT}; font-weight:500; font-size:12px;">&nbsp;&middot; {len(findings)} REGIONS FOUND</span></div>', unsafe_allow_html=True)
            rows = ""
            for f in findings:
                icon_name = DAMAGE_ICONS.get(f["damage_type"].lower(), "alert-triangle")
                rows += f"""
                <div class="cardd-finding">
                    <div class="cardd-finding-left">
                        <div class="cardd-finding-icon">{icon(icon_name, size=16, color=ACCENT)}</div>
                        <div>
                            <div class="cardd-finding-type">{f['damage_type'].title()}</div>
                            <div class="cardd-finding-loc">bbox: {f['bbox']}</div>
                        </div>
                    </div>
                    <div class="cardd-finding-pct">{f['area_pct_of_image']}%</div>
                </div>
                """
            st.markdown(rows, unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

    # ---- AI DAMAGE REPORT ----
    if data and data.get("report"):
        report = data["report"]
        damage_assessment = report.get("damage_assessment", [])
        n_severe = sum(1 for d in damage_assessment if d.get("severity") == "severe")
        n_moderate = sum(1 for d in damage_assessment if d.get("severity") == "moderate")
        n_minor = sum(1 for d in damage_assessment if d.get("severity") == "minor")

        if n_severe:
            overall, overall_cls = "Severe", "badge-severe"
        elif n_moderate:
            overall, overall_cls = "Moderate", "badge-moderate"
        else:
            overall, overall_cls = "Minor", "badge-minor"

        st.markdown('<div id="report-section"></div>', unsafe_allow_html=True)
        st.markdown(f"""
        <div class="cardd-panel">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="cardd-step-num" style="background:{PANEL}; border:1px solid {PANEL_BORDER}; color:{ACCENT};">{icon("file-text", size=14, color=ACCENT)}</div>
                    <div>
                        <div class="cardd-panel-title">AI Damage Report</div>
                        <div style="font-size:12px; color:{SUBTEXT};">AI-generated vehicle assessment</div>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)

        s1, s2, s3 = st.columns(3)
        with s1:
            st.markdown(f"""<div class="stat-card"><div class="stat-label">Overall Severity</div>
                <span class="badge {overall_cls}" style="font-size:13px;">{overall}</span></div>""", unsafe_allow_html=True)
        with s2:
            st.markdown(f"""<div class="stat-card"><div class="stat-label">Damage Found</div>
                <div class="stat-value">{len(damage_assessment)}</div>
                <div class="stat-sub">{n_severe} severe &middot; {n_moderate} moderate &middot; {n_minor} minor</div></div>""", unsafe_allow_html=True)
        with s3:
            st.markdown(f"""<div class="stat-card"><div class="stat-label">Repair Time</div>
                <div class="stat-value">{report.get('estimated_repair_time_hours', '-')} <span style="font-size:15px; font-weight:600; color:{SUBTEXT};">hrs</span></div></div>""", unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown(f'<div style="font-weight:700; font-size:15px; margin-bottom:2px;">Damage Assessment</div><div style="font-size:12px; color:{SUBTEXT}; margin-bottom:10px;">Detected damage and vehicle locations</div>', unsafe_allow_html=True)
        for d in damage_assessment:
            st.markdown(f"""
            <div class="cardd-finding" style="align-items:flex-start;">
                <div class="cardd-finding-left" style="align-items:flex-start;">
                    <div class="cardd-finding-icon" style="margin-top:2px;">{icon(DAMAGE_ICONS.get(d['damage_type'].lower(), 'alert-triangle'), size=16, color=ACCENT)}</div>
                    <div>
                        <div class="cardd-finding-type">{d['damage_type'].title()} &nbsp;{badge(d['severity'])}</div>
                        <div class="cardd-finding-loc" style="color:{ACCENT}; margin: 2px 0 6px 0;">{d['location_on_vehicle']}</div>
                        <div style="font-size:13.5px; color:{SUBTEXT};">{d['description']}</div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        rp_col, tool_col = st.columns(2)
        with rp_col:
            steps_html = f'<div class="cardd-panel" style="background:#0f0f10;"><div style="font-weight:700; font-size:14.5px; margin-bottom:14px;">{icon("wrench", size=16, color=ACCENT)}&nbsp; Repair Plan</div>'
            for i, step in enumerate(report.get("repair_steps", []), 1):
                steps_html += f'<div class="step-row"><div class="step-circle">{i}</div><div class="step-text">{step}</div></div>'
            steps_html += "</div>"
            st.markdown(steps_html, unsafe_allow_html=True)
        with tool_col:
            tools_html = f'<div class="cardd-panel" style="background:#0f0f10;"><div style="font-weight:700; font-size:14.5px; margin-bottom:14px;">{icon("toolbox", size=16, color=ACCENT)}&nbsp; Tools &amp; Equipment</div>'
            for tool in report.get("tools_and_equipment_needed", []):
                tools_html += f'<div class="tool-row"><span class="tool-check">✓</span>{tool}</div>'
            tools_html += "</div>"
            st.markdown(tools_html, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        tech_cost = report.get("technician_service_cost_egp", {})
        parts_cost = report.get("equipment_and_parts_cost_egp", {})
        total_cost = report.get("total_estimated_cost_egp", {})

        st.markdown(f'<div style="font-weight:700; font-size:15px; margin-bottom:12px;">{icon("dollar", size=16, color=ACCENT)}&nbsp; Estimated Repair Cost</div>', unsafe_allow_html=True)
        c1, c2, c3 = st.columns([1, 1, 1.2])
        with c1:
            st.markdown(f'<div class="cost-label">Technician</div><div class="cost-value">{tech_cost.get("min","-")} – {tech_cost.get("max","-")} EGP</div>', unsafe_allow_html=True)
        with c2:
            st.markdown(f'<div class="cost-label">Parts &amp; Equipment</div><div class="cost-value">{parts_cost.get("min","-")} – {parts_cost.get("max","-")} EGP</div>', unsafe_allow_html=True)
        with c3:
            st.markdown(f'<div class="total-cost-box"><div class="total-cost-label">Total Estimated Cost</div><div class="total-cost-value">{total_cost.get("min","-")} – {total_cost.get("max","-")} EGP</div></div>', unsafe_allow_html=True)

        notes = report.get("notes")
        if notes:
            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown(f'<div style="font-size:11px; letter-spacing:0.06em; color:{SUBTEXT}; font-weight:600; margin-bottom:8px;">AI ASSESSMENT NOTES</div><div class="notes-box">{notes}</div>', unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

        # ---- Export row ----
        e1, e2, _ = st.columns([1, 1, 3])
        with e1:
            try:
                pdf_bytes = build_pdf(report, findings, image_bytes=st.session_state.annotated)
                st.download_button(":material/description: Download PDF", data=pdf_bytes,
                                    file_name="cardd_damage_report.pdf",
                                    mime="application/pdf", use_container_width=True)
            except Exception as e:
                st.caption(f"PDF export unavailable: {e}")
        with e2:
            st.download_button(":material/data_object: Download JSON", data=json.dumps(data, indent=2, ensure_ascii=False),
                                file_name="cardd_analysis.json", mime="application/json",
                                use_container_width=True)

    elif data and not data.get("report"):
        st.warning("No Gemini report was returned for this image.")

# ===========================================================================
# TAB: HISTORY
# ===========================================================================
with tab_history:
    st.markdown("""
    <div class="cardd-eyebrow">PAST ANALYSES</div>
    <h1 style="font-size:28px; font-weight:800; margin-bottom:6px;">History</h1>
    <p style="color:#8a8a8f; font-size:14px; margin-bottom:22px;">Every image you've analyzed in this session, most recent first.</p>
    """, unsafe_allow_html=True)

    if not st.session_state.history:
        st.markdown('<div class="empty-state">No analyses yet — head to the Analyze tab to scan your first image.</div>', unsafe_allow_html=True)
    else:
        for i, item in enumerate(st.session_state.history):
            n_findings = len(item["findings"])
            total = (item["report"] or {}).get("total_estimated_cost_egp", {})
            cost_txt = f"{total.get('min','-')} – {total.get('max','-')} EGP" if total else "—"
            with st.container():
                cols = st.columns([0.12, 0.68, 0.2])
                with cols[0]:
                    st.image(item["thumb"], use_container_width=True)
                with cols[1]:
                    st.markdown(f"""
                    <div class="history-title">{item['filename']}</div>
                    <div class="history-meta">{item['time']} &middot; {n_findings} damage region(s) &middot; {cost_txt}</div>
                    """, unsafe_allow_html=True)
                with cols[2]:
                    if item["report"]:
                        try:
                            pdf_bytes = build_pdf(item["report"], item["findings"],
                                                   image_bytes=item.get("annotated"))
                            st.download_button(":material/description: PDF", data=pdf_bytes,
                                                file_name=f"cardd_report_{i}.pdf",
                                                mime="application/pdf", key=f"hist_pdf_{i}",
                                                use_container_width=True)
                        except Exception:
                            pass
                st.markdown(f'<hr style="border-color:{PANEL_BORDER}; margin: 10px 0 18px 0;">', unsafe_allow_html=True)

# ===========================================================================
# TAB: ABOUT
# ===========================================================================
with tab_about:
    st.markdown("""
    <div class="cardd-eyebrow">HOW IT WORKS</div>
    <h1 style="font-size:28px; font-weight:800; margin-bottom:6px;">About CarDD</h1>
    """, unsafe_allow_html=True)

    st.markdown(f"""
    <div class="cardd-panel">
        <div class="cardd-panel-title" style="margin-bottom:10px;">Two-stage pipeline</div>
        <div style="font-size:14px; color:{SUBTEXT}; line-height:1.7;">
        CarDD detects and localizes vehicle damage in two steps. First, a YOLOv8-seg model finds every
        damaged region in the photo — dents, scratches, cracks, shattered glass, broken lamps, and flat
        tires — and measures how much of the image each region covers. Then a vision-language model
        (Gemini) looks at the same photo alongside those detections and writes a full technician's
        report: severity per region, a step-by-step repair plan, the tools needed, and a realistic
        Egyptian-market cost and time estimate.
        </div>
    </div>
    """, unsafe_allow_html=True)

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(f"""<div class="stat-card"><div class="stat-label">Detector</div>
            <div style="font-weight:700; font-size:16px;">YOLOv8-seg</div>
            <div class="stat-sub">Trained on CarDD damage classes</div></div>""", unsafe_allow_html=True)
    with c2:
        st.markdown(f"""<div class="stat-card"><div class="stat-label">Report writer</div>
            <div style="font-weight:700; font-size:16px;">Gemini</div>
            <div class="stat-sub">Severity, repair plan &amp; cost</div></div>""", unsafe_allow_html=True)
    with c3:
        st.markdown(f"""<div class="stat-card"><div class="stat-label">API</div>
            <div style="font-weight:700; font-size:16px;">FastAPI</div>
            <div class="stat-sub"><a href="{API_BASE_URL}/docs" style="color:{ACCENT};">{API_BASE_URL}/docs</a></div></div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown(f"""
    <div class="cardd-panel">
        <div class="cardd-panel-title" style="margin-bottom:10px;">Damage classes</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
            {''.join(f'<span class="badge badge-moderate">{icon(ic_name, size=12)} {name.title()}</span>' for name, ic_name in DAMAGE_ICONS.items())}
        </div>
    </div>
    """, unsafe_allow_html=True)