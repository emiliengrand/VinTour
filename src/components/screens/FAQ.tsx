import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQProps {
  navigate: (screen: string) => void;
}

export default function FAQ({ navigate }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Comment déposer des vêtements sans colis ?',
      answer: 'Crée ton annonce dans l\'app Vinted et génère un QR Code. Viens au bus, présente le code à un bénévole qui scannera ton article. Tu laisses le vêtement directement sans emballage. Simple et rapide !',
    },
    {
      question: 'Comment fonctionne le Click & Try ?',
      answer: 'Repère l\'article qui t\'intéresse dans l\'app, réserve-le gratuitement via le bouton "Click & Try", puis viens au bus pour l\'essayer dans la cabine. Si ça te va, tu repars avec. Sinon, tu peux le laisser sans frais.',
    },
    {
      question: 'Comment marche le Scan & Pay ?',
      answer: 'Dans la zone Outlet, scanne l\'étiquette de l\'article avec ton téléphone, ajoute-le à ton panier et paie directement dans l\'app. À la sortie, présente ton code QR de paiement pour valider.',
    },
    {
      question: 'Que faire si le scan ne marche pas ?',
      answer: 'Assure-toi que l\'étiquette est bien visible et éclairée. Si le problème persiste, rapproche-toi d\'un bénévole qui pourra t\'aider ou scanner l\'article manuellement.',
    },
    {
      question: 'Horaires et planning du bus',
      answer: 'Le bus circule 7 jours sur 7 dans différentes villes du Bassin Minier. Consulte l\'onglet "Carte" pour voir le planning complet et active les alertes pour être prévenu des passages près de chez toi.',
    },
    {
      question: 'Puis-je payer en espèces ?',
      answer: 'Oui ! Bien que le paiement mobile soit encouragé, tu peux aussi payer en espèces ou par carte bancaire à bord du bus auprès d\'un bénévole.',
    },
    {
      question: 'Le bus est-il accessible en fauteuil roulant ?',
      answer: 'Oui, le Vinted Bus est équipé d\'une rampe d\'accès pour les personnes à mobilité réduite. N\'hésite pas à demander de l\'aide aux bénévoles présents.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white h-full">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('profile')} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Aide / FAQ</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Questions fréquentes</h2>
          <p className="text-gray-600">
            Trouve rapidement des réponses à tes questions sur le Vinted Bus.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-start justify-between gap-3"
              >
                <span className="font-medium text-left">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200 space-y-3">
          <h3 className="font-medium">Besoin d'aide supplémentaire ?</h3>
          <p className="text-sm text-gray-700">
            Contacte-nous directement ou parle à un bénévole à bord du bus.
          </p>
          <div className="flex gap-2">
            <button className="flex-1 py-3 bg-white border border-gray-300 rounded-lg font-medium text-sm">
              Email
            </button>
            <button className="flex-1 py-3 bg-white border border-gray-300 rounded-lg font-medium text-sm">
              Chat en direct
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
