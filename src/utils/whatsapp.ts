
interface WhatsAppValidationResponse {
  exists: string;
  whatsapp: string;
}

export async function validateWhatsAppNumber(phoneNumber: string): Promise<{ exists: boolean; whatsappId?: string }> {
  try {
    const credentials = btoa('Cashflow:Cashflow123');
    
    const webhookUrl = 'https://n8n.forteia.com.br/webhook-test/verifica-zap';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        number: phoneNumber
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao validar WhatsApp');
    }

    const data: WhatsAppValidationResponse = await response.json();
    
    return {
      exists: data.exists === 'true',
      whatsappId: data.exists === 'true' ? data.whatsapp : undefined
    };
  } catch (error) {
    console.error('Erro na validação do WhatsApp:', error);
    throw new Error('Não foi possível validar o número do WhatsApp');
  }
}
