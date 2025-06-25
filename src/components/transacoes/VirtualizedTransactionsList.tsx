
import React, { memo, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Transacao } from '@/types/transaction'
import { TransactionCard } from './TransactionCard'
import { motion } from 'framer-motion'

interface VirtualizedTransactionsListProps {
  transacoes: Transacao[]
  onEdit: (transacao: Transacao) => void
  onDelete: (id: number) => void
  onCreateNew: () => void
  isReadOnly: boolean
  isEmpty: boolean
}

const ITEM_HEIGHT = 120; // Altura aproximada de cada item

const TransactionItem = memo(({ index, style, data }: any) => {
  const { transacoes, onEdit, onDelete, isReadOnly } = data;
  const transacao = transacoes[index];

  return (
    <div style={style}>
      <motion.div 
        className="px-2 pb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <TransactionCard 
          transacao={transacao}
          onEdit={onEdit}
          onDelete={onDelete}
          isReadOnly={isReadOnly}
        />
      </motion.div>
    </div>
  );
});

TransactionItem.displayName = "TransactionItem";

export const VirtualizedTransactionsList = memo(({ 
  transacoes, 
  onEdit, 
  onDelete, 
  onCreateNew, 
  isReadOnly,
  isEmpty 
}: VirtualizedTransactionsListProps) => {
  const itemData = useMemo(() => ({
    transacoes,
    onEdit,
    onDelete,
    isReadOnly
  }), [transacoes, onEdit, onDelete, isReadOnly]);

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-muted-foreground mb-4">
              {transacoes.length === 0 ? 'Nenhuma transação encontrada' : 'Nenhuma transação encontrada com os filtros aplicados'}
            </p>
            <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90">
              Adicionar primeira transação
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Para listas pequenas (< 50 itens), renderize normalmente
  if (transacoes.length < 50) {
    return (
      <div className="space-y-4">
        {transacoes.map((transacao, index) => (
          <motion.div
            key={transacao.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <TransactionCard 
              transacao={transacao}
              onEdit={onEdit}
              onDelete={onDelete}
              isReadOnly={isReadOnly}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // Para listas grandes, use virtualização
  return (
    <div className="h-[600px] w-full">
      <List
        height={600}
        itemCount={transacoes.length}
        itemSize={ITEM_HEIGHT}
        itemData={itemData}
        overscanCount={5}
      >
        {TransactionItem}
      </List>
    </div>
  );
});

VirtualizedTransactionsList.displayName = "VirtualizedTransactionsList";
