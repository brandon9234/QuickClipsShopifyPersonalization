# Personalization Pipeline

## Frontend Flow

1. User clicks `Customize Now` trigger.
2. Modal opens and initializes from scoped state.
3. Agent/user edits style and text fields.
4. Generate posts JSON payload (including deterministic context image data when available).
5. Gemini response is validated, but the visible and saved preview remains browser-rendered from the deterministic stage surface.
6. Save writes values to hidden line-item properties and attaches the stage preview file property.

## State + Persistence

- In-memory state is keyed by `data-personalization-scope`.
- Hidden inputs in `personalization-line-item-properties` persist to cart line-item properties.
- Trigger label changes to `Edit Customization` when configured.
- `Personalization Primary Text`, `Personalization Secondary Text`, and `_Personalization Gemini Preview` remain compatibility properties, not the primary source of truth for the current UI.

## Failure Modes to Check

- API route unreachable or misconfigured.
- Model ID unavailable for the provided key.
- Generated response missing expected image payload keys.
- Style image path mismatch (file extension or missing asset).
- Theme not refreshed after file updates in local preview.
- Liquid/JS selector drift between modal, trigger, hidden properties, and theme includes.
