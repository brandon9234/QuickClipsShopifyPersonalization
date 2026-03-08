# Personalization Pipeline

## Frontend Flow

1. User clicks `Customize Now` trigger.
2. Modal opens and initializes from scoped state.
3. Agent/user edits style and text fields.
4. Generate posts JSON payload (including style image context when available).
5. Response updates generated summary and generated preview image.
6. Save writes values to hidden line-item properties.

## State + Persistence

- In-memory state is keyed by `data-personalization-scope`.
- Hidden inputs in `personalization-line-item-properties` persist to cart line-item properties.
- Trigger label changes to `Edit Customization` when configured.

## Failure Modes to Check

- API route unreachable or misconfigured.
- Model ID unavailable for the provided key.
- Generated response missing expected preview keys.
- Style image path mismatch (file extension or missing asset).
- Theme not refreshed after file updates in local preview.

