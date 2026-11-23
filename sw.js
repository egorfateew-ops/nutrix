/* NUTRIX cloud account and shared-plan UI */
[hidden]{display:none!important}
.cloud-open-button{display:flex;align-items:center;gap:7px;border:1px solid var(--line);background:var(--surface);color:var(--text);padding:9px 13px;border-radius:11px;font:800 11px 'Manrope',sans-serif;cursor:pointer;white-space:nowrap}
.cloud-open-button:hover{border-color:#76bce8;color:var(--blue)}
.cloud-dialog{width:min(620px,calc(100vw - 24px));max-height:min(88vh,850px);padding:0;border:1px solid var(--line);border-radius:22px;background:var(--bg);color:var(--text);box-shadow:0 25px 90px #001b2c55}
.cloud-dialog::backdrop{background:#071a2bbd;backdrop-filter:blur(5px)}
#cloudContent{padding:24px;max-height:min(88vh,850px);overflow:auto}
.cloud-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:17px}
.cloud-modal-head h2{font-size:23px;letter-spacing:-.7px;margin:4px 0}
.cloud-modal-head p{font-size:11px;color:var(--muted);margin:0}
.cloud-section{border:1px solid var(--line);border-radius:15px;background:var(--surface);padding:17px;margin-top:13px}
.cloud-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}
.cloud-section-head h3{font-size:13px;margin:0 0 3px}
.cloud-section-head p{font-size:10px;color:var(--muted);margin:0}
.cloud-state{font-size:9px;font-weight:800;color:#9b7a45;background:#f8f0df;border-radius:30px;padding:6px 9px;white-space:nowrap}
.cloud-state.is-online{color:#16815f;background:#e5f7ef}
.cloud-config-form,.cloud-auth-form{display:grid;gap:11px}
.cloud-config-form label,.cloud-auth-form label{display:grid;gap:6px;font-size:10px;font-weight:800;color:var(--muted)}
.cloud-config-form input,.cloud-auth-form input,.cloud-config-form small{font-size:9px;color:var(--muted);line-height:1.5}
.cloud-button-row{display:flex;gap:8px;flex-wrap:wrap}
.cloud-primary,.cloud-secondary{border:1px solid transparent;border-radius:9px;padding:10px 13px;font:800 10px 'Manrope',sans-serif;cursor:pointer}
.cloud-primary{background:var(--blue);color:#fff}
.cloud-secondary{background:var(--blue-soft);border-color:var(--line);color:var(--text)}
.cloud-primary:disabled,.cloud-secondary:disabled{opacity:.45;cursor:not-allowed}
.cloud-link-button{border:0;background:none;color:var(--blue);font:800 10px 'Manrope',sans-serif;cursor:pointer;text-decoration:none;padding:5px 0}
.cloud-config-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;color:var(--muted)}
.cloud-message{min-height:16px;color:#16815f;font-size:10px;line-height:1.5;margin:5px 0}
.cloud-message.is-error{color:#c14f4f}
.cloud-account{display:grid;gap:13px}
.cloud-user-line{display:flex;align-items:center;gap:11px}
.cloud-avatar{width:42px;height:42px;border-radius:13px;background:var(--blue-soft);color:var(--blue);display:grid;place-items:center;font-size:20px;font-weight:900}
.cloud-user-line b,.cloud-user-line small{display:block;font-size:11px}
.cloud-user-line small{font-size:9px;color:var(--muted);margin-top:3px}
.cloud-history{display:grid;gap:7px;margin-top:12px;max-height:220px;overflow:auto}
.cloud-history>p{font-size:10px;color:var(--muted);margin:0}
.cloud-history-item{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--text);text-align:left;cursor:pointer}
.cloud-history-item:hover{border-color:#76bce8}
.cloud-history-item b{font-size:10px}
.cloud-history-item small{font-size:9px;color:var(--muted)}
.cloud-footer-note{font-size:9px;line-height:1.5;color:var(--muted);margin-top:14px}
body.dark .cloud-state{background:#3a3325;color:#e9d5a5}
body.dark .cloud-state.is-online{background:#173d35;color:#91dfbf}
@media(max-width:680px){.cloud-open-button{padding:8px 9px;font-size:9px}.cloud-open-button span{display:none}#cloudContent{padding:18px}.cloud-modal-head h2{font-size:20px}.cloud-section{padding:14px}.cloud-button-row>*{flex:1}.shared-view{padding-top:22px}.shared-view-head{padding:20px}.shared-days-grid{grid-template-columns:1fr}.shared-cart{grid-template-columns:1fr}.shared-shop-head{align-items:flex-start;flex-direction:column}.shared-actions>*{width:100%}}


/* Personal progress diary */
.cloud-progress-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}
.cloud-progress-form label{display:grid;gap:5px;color:var(--muted);font-size:9px;font-weight:800}
.cloud-progress-form input{width:100%;min-width:0;border:1px solid var(--line);border-radius:9px;padding:10px;background:var(--bg);color:var(--text);font:600 11px 'Manrope',sans-serif}
.cloud-progress-form .progress-note-field{grid-column:1/-1}
.cloud-progress-form .progress-submit{grid-column:1/-1;justify-self:start}
.progress-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:15px 0}
.progress-stat{padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--bg)}
.progress-stat small,.progress-stat b{display:block}
.progress-stat small{font-size:8px;color:var(--muted);line-height:1.4}
.progress-stat b{font-size:16px;margin-top:5px;letter-spacing:-.4px}
.progress-chart{padding:10px 4px;border:1px solid var(--line);border-radius:12px;background:var(--bg);min-height:74px}
.progress-chart>p,.progress-empty{font-size:10px;color:var(--muted);text-align:center;padding:10px;margin:0}
.progress-chart svg{display:block;width:100%;height:auto;max-height:250px;overflow:visible}
.progress-grid-line{stroke:var(--line);stroke-width:1;stroke-dasharray:3 4}
.progress-axis-label{fill:var(--muted);font-size:10px}
.progress-line{fill:none;stroke:var(--blue);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.progress-dot{fill:var(--blue);stroke:var(--surface);stroke-width:2}
.progress-history{display:grid;gap:7px;margin-top:12px}
.progress-entry{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg)}
.progress-entry-details{min-width:0}
.progress-entry-details b,.progress-entry-details small{display:block}
.progress-entry-details b{font-size:10px}
.progress-entry-details small{font-size:9px;color:var(--muted);margin-top:3px}
.progress-entry-details p{font-size:9px;color:var(--muted);margin:5px 0 0;overflow-wrap:anywhere}
.progress-delete{border:0;background:transparent;color:#c45b5b;font:800 9px 'Manrope',sans-serif;cursor:pointer;padding:7px}
@media(max-width:520px){.cloud-progress-form{grid-template-columns:1fr 1fr}.progress-summary{gap:5px}.progress-stat{padding:9px}.progress-stat b{font-size:13px}.progress-entry{align-items:flex-start}.progress-delete{padding:5px}}
