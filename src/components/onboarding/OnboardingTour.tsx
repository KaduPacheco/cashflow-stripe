
import React, { useState, useEffect } from 'react'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import { Button } from '@/components/ui/button'

interface OnboardingTourProps {
  show: boolean
  onComplete: () => void
}

const steps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-primary">Dashboard Principal</h3>
        <p className="text-sm text-muted-foreground">
          Aqui você tem uma visão geral das suas finanças: receitas, despesas, saldo atual e lembretes importantes.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="transacoes"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-primary">Transações</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie todas as suas receitas e despesas. Adicione, edite e organize suas transações financeiras.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="lembretes"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-primary">Lembretes</h3>
        <p className="text-sm text-muted-foreground">
          Nunca mais esqueça de pagar uma conta! Configure lembretes para suas obrigações financeiras.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="categorias"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-primary">Categorias</h3>
        <p className="text-sm text-muted-foreground">
          Organize suas transações por categorias para um controle mais detalhado dos seus gastos.
        </p>
      </div>
    ),
    placement: 'right',
  },
]

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ show, onComplete }) => {
  const [run, setRun] = useState(false)

  useEffect(() => {
    if (show) {
      // Pequeno delay para garantir que os elementos estejam renderizados
      setTimeout(() => setRun(true), 500)
    }
  }, [show])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
      onComplete()
    }
  }

  if (!show) return null

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          textColor: 'hsl(var(--foreground))',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: 'hsl(var(--background))',
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
          fontSize: '14px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: '8px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular tutorial',
      }}
    />
  )
}
