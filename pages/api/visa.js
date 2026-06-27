import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialisation sécurisée côté serveur
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { action, raw_description, form_data, application_id } = req.body;

    // ÉTAPE 1 : Soumission et Analyse par l'IA
    if (action === 'submit') {
      const promptSystem = `
        Tu es un agent consulaire expert pour les visas France/Schengen (style Capago / VFS).
        Analyse la description du voyage et génère un objet JSON contenant :
        1. "checklist": une liste de documents obligatoires adaptés à sa situation professionnelle et son motif.
        2. "conseils": des instructions précises pour remplir les cases clés du formulaire officiel France-Visas.
        Réponds UNIQUEMENT sous forme d'un objet JSON pur.
      `;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: promptSystem },
          { role: "user", content: `Description: ${raw_description}. Informations complémentaires: ${JSON.stringify(form_data)}` }
        ],
        response_format: { type: "json_object" }
      });

      const parsedAnalysis = JSON.parse(aiResponse.choices[0].message.content);

      // Sauvegarde sécurisée dans Supabase
      const { data, error } = await supabase
        .from('visa_applications')
        .insert([{ 
          raw_description, 
          full_form_data: form_data, 
          generated_checklist: parsedAnalysis, 
          is_paid: false 
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ id: data.id });
    }

    // ÉTAPE 2 : Simulation de la validation du paiement Mobile Money
    if (action === 'verify_payment') {
      // Dans un cas réel, vous lieriez ceci au webhook de votre passerelle (ex: FedaPay, CinetPay, Wave)
      const { data, error } = await supabase
        .from('visa_applications')
        .update({ is_paid: true })
        .eq('id', application_id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, application: data });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
