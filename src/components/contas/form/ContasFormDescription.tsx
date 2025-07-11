
interface ContasFormDescriptionProps {
  conta?: any
}

export function ContasFormDescription({ conta }: ContasFormDescriptionProps) {
  return (
    <p className="text-sm text-muted-foreground mb-6">
      {conta ? 'Edite os dados do lançamento.' : 'Registre um lançamento previsto para o futuro.'}
    </p>
  )
}
