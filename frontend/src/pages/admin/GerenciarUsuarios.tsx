import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Shield, ShieldAlert, Trash2, UserX, UserPlus, Edit2, X, Save } from 'lucide-react';

interface UserInfo {
  id: string;
  email: string;
  role: string | null;
  created_at: string;
}

export const GerenciarUsuarios = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('visitor');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_users');
    if (data) {
      setUsers(data as UserInfo[]);
    } else if (error) {
      alert('Erro ao buscar usuários. Certifique-se de ser um admin e de ter executado os scripts SQL.');
    }
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    if(!window.confirm(`Conceder permissão de ${newRole} a este usuário?`)) return;
    const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });
    if (!error) fetchUsers();
    else alert('Erro ao atualizar permissão: ' + error.message);
  };

  const deleteRole = async (userId: string) => {
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (!error) fetchUsers();
    else alert('Erro ao revogar permissão: ' + error.message);
  };

  const deleteUserCompletely = async (userId: string, email: string) => {
    if(!window.confirm(`ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE a conta de ${email}?\n\nEsta ação não pode ser desfeita e ele perderá o login do site.`)) return;
    setLoading(true);
    const { error } = await supabase.rpc('delete_user_completely', { target_user_id: userId });
    if (!error) fetchUsers();
    else {
      alert('Erro ao excluir conta permanentemente: ' + error.message);
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingUserId(null);
    setFormEmail('');
    setFormPassword('');
    setFormRole('visitor');
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserInfo) => {
    setModalMode('edit');
    setEditingUserId(u.id);
    setFormEmail(u.email);
    setFormPassword('');
    setFormRole(u.role || 'visitor');
    setIsModalOpen(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (modalMode === 'create') {
      if (formPassword.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
      }
      
      const { error } = await supabase.rpc('admin_create_user', {
        new_email: formEmail,
        new_password: formPassword,
        new_role: formRole
      });
      
      if (error) alert('Erro ao criar usuário: ' + error.message);
      else {
        setIsModalOpen(false);
        fetchUsers();
      }
    } else {
      // Edit User Credentials (Email / Password)
      const { error } = await supabase.rpc('admin_update_user', {
        target_user_id: editingUserId,
        new_email: formEmail,
        new_password: formPassword // Pode ser vazio se não quiser alterar
      });
      
      if (error) alert('Erro ao atualizar credenciais: ' + error.message);
      else {
        setIsModalOpen(false);
        fetchUsers();
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contas Registradas</h1>
          <p className="text-gray-600 mt-2">Lista completa e controle absoluto de credenciais do sistema.</p>
        </div>
        <button onClick={openCreateModal} className="bg-eco-primary hover:bg-eco-dark text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <UserPlus size={20} /> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Buscando contas seguras...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum usuário registrado ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600 w-1/3">E-mail da Conta</th>
                  <th className="p-4 font-bold text-gray-600">Nível de Acesso</th>
                  <th className="p-4 font-bold text-gray-600">Primeiro Login</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                      {u.email}
                      <button onClick={() => openEditModal(u)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md" title="Editar Senha ou E-mail">
                        <Edit2 size={14} />
                      </button>
                    </td>
                    
                    <td className="p-4">
                      {u.role === 'admin' ? (
                        <span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                          <Shield size={14} /> Administrador
                        </span>
                      ) : u.role === 'employee' ? (
                        <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                          <ShieldAlert size={14} /> Funcionário
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit border border-gray-300">
                          <UserX size={14} /> Sem Acesso (Visitante)
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    
                    <td className="p-4 text-right flex justify-end gap-2 items-center">
                      <select 
                        value={u.role || 'visitor'} 
                        onChange={(e) => {
                          if (e.target.value === 'visitor') deleteRole(u.id);
                          else updateRole(u.id, e.target.value);
                        }}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-eco-primary cursor-pointer shadow-sm"
                      >
                        <option value="visitor">Visitante (Sem Acesso)</option>
                        <option value="admin">Administrador</option>
                        <option value="employee">Funcionário</option>
                      </select>
                      
                      <button onClick={() => deleteUserCompletely(u.id, u.email)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-2 border border-transparent hover:border-red-200 transition-colors" title="Excluir Conta Permanentemente">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar Credenciais */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {modalMode === 'create' ? 'Criar Novo Usuário' : 'Editar Credenciais'}
            </h2>
            
            <form onSubmit={saveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">E-mail</label>
                <input 
                  type="email" 
                  required 
                  value={formEmail} 
                  onChange={e => setFormEmail(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-primary focus:border-transparent outline-none" 
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  {modalMode === 'create' ? 'Senha' : 'Nova Senha (deixe em branco para não mudar)'}
                </label>
                <input 
                  type="password" 
                  required={modalMode === 'create'} 
                  value={formPassword} 
                  onChange={e => setFormPassword(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-primary focus:border-transparent outline-none" 
                  placeholder="******"
                  minLength={6}
                />
                {modalMode === 'edit' && <p className="text-xs text-gray-500 mt-1">Isso alterará imediatamente a senha de login deste usuário.</p>}
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Permissão Inicial</label>
                  <select 
                    value={formRole} 
                    onChange={e => setFormRole(e.target.value)} 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-primary focus:border-transparent outline-none bg-white"
                  >
                    <option value="visitor">Sem Acesso (Visitante)</option>
                    <option value="employee">Funcionário</option>
                    <option value="admin">Administrador (Acesso Total)</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-eco-primary hover:bg-eco-dark rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md">
                  <Save size={18} /> {modalMode === 'create' ? 'Cadastrar' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
