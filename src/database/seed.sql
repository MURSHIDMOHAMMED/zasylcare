insert into companies (id, name, slug, primary_color, support_email, phone, timezone)
values ('00000000-0000-4000-8000-000000000001', 'Zasilcare Health', 'zasilcare-health', '#0f766e', 'support@zasilcare.example', '+1 555 010 2040', 'America/New_York')
on conflict (id) do update set
name = excluded.name,
slug = excluded.slug,
primary_color = excluded.primary_color,
support_email = excluded.support_email,
phone = excluded.phone,
timezone = excluded.timezone,
updated_at = now();

insert into company_knowledge (company_id, title, category, content, enabled)
values
('00000000-0000-4000-8000-000000000001', 'Company Overview', 'Company Info', 'Zasilcare Health provides healthcare support and consultation services focused on continuous healthcare management for patients, especially people with ongoing health conditions.', true),
('00000000-0000-4000-8000-000000000001', 'Healthcare Support', 'Services', 'Zasilcare Health helps patients coordinate care, understand next steps, and request consultation support for ongoing healthcare needs.', true),
('00000000-0000-4000-8000-000000000001', 'Consultation Process', 'FAQ', 'Patients can request a consultation by sharing their concern, preferred date and time, and contact details. The care team reviews the request and follows up with next steps.', true);

insert into services (company_id, name, description, price_label, enabled)
values
('00000000-0000-4000-8000-000000000001', 'Healthcare Consultation Support', 'Consultation support for patients who need help with health concerns and care planning.', 'Contact team', true),
('00000000-0000-4000-8000-000000000001', 'Continuous Care Management', 'Ongoing support for patients managing long-term or recurring health conditions.', 'Contact team', true),
('00000000-0000-4000-8000-000000000001', 'Patient Follow-up Coordination', 'Care team follow-up to help patients stay connected with the right healthcare guidance.', 'Contact team', true);

insert into chatbot_settings (company_id, greeting, tone, handoff_email)
values ('00000000-0000-4000-8000-000000000001', 'Hi, welcome to Zasilcare Health. What health concern or consultation question can we help with?', 'professional', 'support@zasilcare.example');

insert into availability_slots (company_id, slot_date, slot_time, enabled)
values
('00000000-0000-4000-8000-000000000001', '2026-05-25', '10:00', true),
('00000000-0000-4000-8000-000000000001', '2026-05-25', '14:00', true),
('00000000-0000-4000-8000-000000000001', '2026-05-26', '11:30', true)
on conflict (company_id, slot_date, slot_time) do nothing;

insert into lead_form_fields (company_id, label, field_type, required, sort_order, conditions)
values
('00000000-0000-4000-8000-000000000001', 'Budget', 'number', false, 1, '{}'),
('00000000-0000-4000-8000-000000000001', 'Location', 'text', true, 2, '{}'),
('00000000-0000-4000-8000-000000000001', 'Consultation type', 'select', true, 3, '{}');
