import { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState(1); // 1: Description, 2: Formulaire, 3: Paiement, 4: Résultats
  const [appId, setAppId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Formulaires
  const [rawDescription, setRawDescription] = useState("");
  const [formData, setFormData] = useState({
    nom: "", prenom: "", telephone: "", situationMatrimoniale: "",
    profession: "", priseEnCharge: "", adresseHebergement: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Envoi des données au backend sécurisé
  const handleAnalyze = async () => {
    setLoading(true);
    const res = await fetch('/api/visa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit', raw_description: rawDescription, form_data: formData })
    });
    const data = await res.json();
    setAppId(data.id);
    setLoading(false);
    setStep(3); // Aller à la page de paiement
  };

  // Simulation du paiement Mobile Money (MTN, Moov, Orange, Wave...)
  const handleMobileMoneyPayment = async () => {
    setLoading(true);
    const res = await fetch('/api/visa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_payment', application_id: appId })
    });
    const data = await res.json();
    if (data.success) {
      setResults(data.application.generated_checklist);
      setStep(4); // Afficher les résultats
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#0055A5', fontSize: '24px' }}>Assistant Visa France Intelligent</h1>
        <p style={{ color: '#666' }}>Vérifiez votre dossier et évitez les refus d'un clic</p>
      </header>

      {/* ÉTAPE 1 : Description Libre */}
      {step === 1 && (
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Décrivez votre voyage afin de mieux vous aider :</label>
          <textarea
            style={{ width: '100%', height: '120px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            placeholder="Ex: Je suis à Cotonou, je vais en Suisse pour le mariage de ma soeur, puis à Paris voir mon frère..."
            value={rawDescription}
            onChange={(e) => setRawDescription(e.target.value)}
          />
          <button onClick={() => setStep(2)} style={{ marginTop: '15px', width: '100%', padding: '12px', background: '#0055A5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Continuer
          </button>
        </div>
      )}

      {/* ÉTAPE 2 : Informations complémentaires pour le formulaire */}
      {step === 2 && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>Informations de pré-remplissage</h3>
          <input type="text" name="nom" placeholder="Nom de famille" onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="text" name="telephone" placeholder="Numéro de téléphone portable" onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="text" name="situationMatrimoniale" placeholder="Situation matrimoniale" onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="text" name="profession" placeholder="Profession actuelle (ou Sans emploi)" onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="text" name="priseEnCharge" placeholder="Qui prend en charge le voyage ?" onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <input type="text" name="adresseHebergement" placeholder="Adresse complète de votre logement sur place" onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          
          <button onClick={handleAnalyze} disabled={loading} style={{ width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? "Analyse IA en cours..." : "Générer mon dossier sécurisé"}
          </button>
        </div>
      )}

      {/* ÉTAPE 3 : Tunnel de Paiement Mobile Money */}
      {step === 3 && (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#ffc107' }}>⚠️ Analyse Terminée avec Succès !</h3>
          <p>L'IA a détecté les pièces manquantes potentielles et préparé vos instructions de remplissage Capago/VFS.</p>
          <div style={{ border: '1px dashed #ccc', padding: '20px', margin: '20px 0', borderRadius: '8px', background: '#f9f9f9' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Montant : 5 000 FCFA</p>
            <p style={{ color: '#666', fontSize: '14px' }}>Payable instantanément par MTN Mobile Money, Moov, Orange Money ou Wave.</p>
          </div>
          <button onClick={handleMobileMoneyPayment} disabled={loading} style={{ width: '100%', padding: '14px', background: '#ffc107', color: '#111', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            {loading ? "Vérification du paiement..." : "Payer par Mobile Money"}
          </button>
        </div>
      )}

      {/* ÉTAPE 4 : Résultats finaux sécurisés */}
      {step === 4 && results && (
        <div>
          <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>✅ Votre Checklist d'Expert Consulaire</h3>
          
          <h4 style={{ marginTop: '15px', color: '#0055A5' }}>Documents requis :</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            {results.checklist && Object.entries(results.checklist).map(([key, value]) => (
              <li key={key}><strong>{key} :</strong> {JSON.stringify(value)}</li>
            ))}
          </ul>

          <h4 style={{ marginTop: '20px', color: '#0055A5' }}>Instructions pour le Formulaire Officiel :</h4>
          <div style={{ background: '#f4f6f9', padding: '15px', borderRadius: '6px', fontSize: '14px', whiteSpace: 'pre-line' }}>
            {results.conseils && Object.entries(results.conseils).map(([key, value]) => (
              <p key={key}><strong>{key} :</strong> {JSON.stringify(value)}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
