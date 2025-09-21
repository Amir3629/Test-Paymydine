# 02_qr_flow.md
1) Admin edit view builds a frontend URL (currently uses table_id).
2) It calls an external QR image service to render the QR for that URL.
3) Frontend Next.js page expects a dynamic segment [table_id] and then fetches /api/table-info or similar.
4) TableController can resolve by id, by qr_code, and sometimes by table_name.

Decision lever:
- If we want URLs like /table/2, either make PK=2 at insert time, or change edit.blade + frontend to resolve by number.