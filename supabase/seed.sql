-- Seed Data for BGMI Tournament Platform (Fictional teams and test data)

INSERT INTO public.tournament_settings (
  id,
  name,
  tagline,
  description,
  registration_open,
  tie_break_rules
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'BGMI CHAMPIONSHIP INVITATIONAL',
  'ROAD TO GLORY: 2-STAGE BATTLEGROUNDS',
  'Official professional BGMI tournament featuring Round 1 Group Stage qualifying battles and the high-stakes Round 2 Grand Final.',
  true,
  '["Total Round Points (descending)", "Total Kills (descending)", "Placement Points (descending)", "Head-to-head performance"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Seed Fictional Groups
INSERT INTO public.groups (id, name) VALUES
  ('22222222-2222-2222-2222-222222222221', 'Group A'),
  ('22222222-2222-2222-2222-222222222222', 'Group B')
ON CONFLICT (id) DO NOTHING;

-- Seed Fictional Approved Teams (Using non-personal fictional esports handles)
INSERT INTO public.team_registrations (
  id, team_name, igl_name, igl_bgmi_uid, whatsapp_number, player_2_bgmi_id, player_3_bgmi_id, player_4_bgmi_id, status
) VALUES
  ('33333333-3333-3333-3333-333333333301', 'TEAM CYPRESS APEX', 'ShadowIGL', '5100000001', '+919876543210', '5100000002', '5100000003', '5100000004', 'approved'),
  ('33333333-3333-3333-3333-333333333302', 'SANDSTORM WARRIORS', 'VortexIGL', '5200000001', '+919876543211', '5200000002', '5200000003', '5200000004', 'approved'),
  ('33333333-3333-3333-3333-333333333303', 'NORTHERN TITANS', 'BlazeIGL', '5300000001', '+919876543212', '5300000002', '5300000003', '5300000004', 'approved'),
  ('33333333-3333-3333-3333-333333333304', 'HYDRA SPECTRES', 'GhostIGL', '5400000001', '+919876543213', '5400000002', '5400000003', '5400000004', 'approved'),
  ('33333333-3333-3333-3333-333333333305', 'RECON LEGION', 'ReconIGL', '5500000001', '+919876543214', '5500000002', '5500000003', '5500000004', 'approved'),
  ('33333333-3333-3333-3333-333333333306', 'VELOCITY RUSH', 'NitroIGL', '5600000001', '+919876543215', '5600000002', '5600000003', '5600000004', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Seed Group Assignments
INSERT INTO public.group_assignments (group_id, team_id) VALUES
  ('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333301'),
  ('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333302'),
  ('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333303'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333304'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333305'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333306')
ON CONFLICT DO NOTHING;
