'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';
import { Building, User, Mail, Badge, Phone } from 'lucide-react';

// Tipagem para os dados do perfil recebidos como propriedade
interface PerfilUsuario {
  nome: string;
  email: string;
  cpf: string | null;
  whatsapp: string | null;
  optica: {
    nome: string;
    cnpj: string;
  } | null;
}

interface Props {
  // Dados iniciais do perfil, vindos da página principal
  dadosIniciais: PerfilUsuario;
  // Callback para notificar a página principal que os dados foram atualizados
  onPerfilAtualizado: (novosDados: Partial<PerfilUsuario>) => void;
}

/**
 * Card para exibir e editar as informações do perfil do usuário.
 * Gerencia seu próprio estado de edição para ser um componente autônomo.
 */
export default function InformacoesPerfilCard({ dadosIniciais, onPerfilAtualizado }: Props) {
  // Estado para controlar o modo de edição
  const [estaEditando, setEstaEditando] = useState(false);
  // Estado para o formulário de edição
  const [formData, setFormData] = useState({
    nome: dadosIniciais.nome,
    cpf: dadosIniciais.cpf || '',
    whatsapp: dadosIniciais.whatsapp || '',
  });
  // Estado para controlar o carregamento da submissão
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para resetar o formulário se os dados iniciais mudarem
  useEffect(() => {
    setFormData({
      nome: dadosIniciais.nome,
      cpf: dadosIniciais.cpf || '',
      whatsapp: dadosIniciais.whatsapp || '',
    });
  }, [dadosIniciais]);

  // Manipulador para atualizar o estado do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manipulador para submeter o formulário de atualização
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Prepara o payload apenas com os dados que podem ser alterados
    const payload = {
      nome: formData.nome,
      cpf: formData.cpf || null,
      whatsapp: formData.whatsapp || null,
    };

    try {
      const response = await api.patch('/perfil/meu', payload);
      toast.success('Perfil atualizado com sucesso!');
      onPerfilAtualizado(response.data); // Notifica o componente pai sobre a mudança
      setEstaEditando(false); // Retorna para o modo de visualização
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error('Falha ao atualizar o perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente interno para exibir um item de informação
  const ItemPerfil = ({ icon: Icon, label, value }) => (
    <div>
      <dt className="flex items-center text-sm font-medium text-muted-foreground">
        <Icon className="w-4 h-4 mr-2" />
        <span>{label}</span>
      </dt>
      <dd className="mt-1 text-base font-semibold text-foreground">{value || 'Não informado'}</dd>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Minhas Informações</h2>
        <p className="mt-1 text-sm text-muted-foreground">Seus dados pessoais e da ótica vinculada.</p>
      </div>
      
      {estaEditando ? (
        // MODO DE EDIÇÃO
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-muted-foreground">Nome Completo</label>
              <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full rounded-md bg-background border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-muted-foreground">CPF</label>
              <input type="text" name="cpf" id="cpf" value={formData.cpf} onChange={handleChange} className="mt-1 block w-full rounded-md bg-background border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-muted-foreground">WhatsApp</label>
              <input type="text" name="whatsapp" id="whatsapp" value={formData.whatsapp} onChange={handleChange} className="mt-1 block w-full rounded-md bg-background border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
            </div>
          </div>
          <div className="bg-muted/50 px-6 py-3 flex justify-end space-x-3">
            <button type="button" onClick={() => setEstaEditando(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      ) : (
        // MODO DE VISUALIZAÇÃO
        <div>
          <dl className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <ItemPerfil icon={User} label="Nome Completo" value={dadosIniciais.nome} />
            <ItemPerfil icon={Mail} label="Email" value={dadosIniciais.email} />
            <ItemPerfil icon={Badge} label="CPF" value={dadosIniciais.cpf} />
            <ItemPerfil icon={Phone} label="WhatsApp" value={dadosIniciais.whatsapp} />
            <div className="sm:col-span-2 border-t border-border pt-6">
              <ItemPerfil icon={Building} label="Nome da Ótica" value={dadosIniciais.optica?.nome} />
            </div>
            <div>
              <ItemPerfil icon={Badge} label="CNPJ da Ótica" value={dadosIniciais.optica?.cnpj} />
            </div>
          </dl>
          <div className="bg-muted/50 px-6 py-3 flex justify-end">
            <button onClick={() => setEstaEditando(true)} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              Editar Perfil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
