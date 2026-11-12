import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';
import {
  IconSearch,
  IconPlus,
  IconUsers,
  IconUserCheck,
  IconCalendarTime,
  IconCurrencyDollar,
  IconX,
  IconPhone,
  IconMail,
  IconCalendar,
  IconEye,
  IconEdit,
  IconClock
} from '@tabler/icons-react';

export const Screen11HR: React.FC = () => {
  const { employees, addEmployee, updateEmployee, updateEmployeeStatus } = useApp();

  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // New employee form
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Employee['department']>('Réception');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [salary, setSalary] = useState(200000);
  const [shift, setShift] = useState<Employee['shift']>('Journée (08h-17h)');

  // Metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'Actif').length;
  const onLeaveEmployees = employees.filter((e) => e.status === 'En congé').length;
  const totalPayroll = employees
    .filter((e) => e.status === 'Actif')
    .reduce((sum, e) => sum + e.salary, 0);

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase()) ||
      emp.matricule.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    const matricule = `RH-${new Date().getFullYear()}-${String(employees.length + 1).padStart(3, '0')}`;
    addEmployee({
      matricule,
      name,
      role,
      department,
      phone: phone || '+225 00 00 00 00 00',
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@galaxyhotel.ci`,
      hireDate: new Date().toISOString().split('T')[0],
      salary: Number(salary),
      status: 'Actif',
      shift,
    });

    setName('');
    setRole('');
    setPhone('');
    setEmail('');
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'Actif':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Actif
          </span>
        );
      case 'En congé':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            En congé
          </span>
        );
      case 'Inactif':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactif
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#263445] tracking-tight">
            Gestion du personnel & RH
          </h2>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4C97DB] hover:bg-[#58A2F7] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <IconPlus stroke={1.75} className="w-4 h-4" />
          <span>Ajouter un employé</span>
        </button>
      </div>

      {/* 4 Métriques RH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Effectif total</span>
            <div className="text-xl font-bold font-mono text-[#263445] mt-1">{totalEmployees}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <IconUsers stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Employés actifs</span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1">{activeEmployees}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IconUserCheck stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">En congé</span>
            <div className="text-xl font-bold font-mono text-amber-600 mt-1">{onLeaveEmployees}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <IconCalendarTime stroke={1.75} className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#718096]">Masse salariale / mois</span>
            <div className="text-xl font-bold font-mono text-[#263445] mt-1">
              {totalPayroll.toLocaleString('fr-FR')} <span className="text-xs font-sans text-[#718096]">FCFA</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4C97DB]/10 text-[#4C97DB] flex items-center justify-center">
            <IconCurrencyDollar stroke={1.75} className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch stroke={1.75} className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, rôle ou matricule..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl text-[#263445] placeholder-[#718096]/70 focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20 focus:border-[#4C97DB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445] focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
          >
            <option value="all">Tous départements</option>
            <option value="Réception">Réception</option>
            <option value="Hébergement & Ménage">Hébergement & Ménage</option>
            <option value="Restaurant & Bar">Restaurant & Bar</option>
            <option value="Cuisine">Cuisine</option>
            <option value="Sécurité & Technique">Sécurité & Technique</option>
            <option value="Direction">Direction</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-xl px-3 py-2 text-[#263445] focus:outline-none focus:ring-2 focus:ring-[#4C97DB]/20"
          >
            <option value="all">Tous statuts</option>
            <option value="Actif">Actif</option>
            <option value="En congé">En congé</option>
            <option value="Inactif">Inactif</option>
          </select>

          {(search || filterDepartment !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterDepartment('all');
                setFilterStatus('all');
              }}
              className="text-xs text-[#718096] hover:text-[#263445] px-2 py-1 rounded-lg hover:bg-[#F5F8FC]"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste Horizontale / Tableau du Personnel */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#718096] border-b border-[#E5EAF1] uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Employé</th>
                <th className="py-3.5 px-4">Département</th>
                <th className="py-3.5 px-4">Shift / Planning</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Salaire brut</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#263445]">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F5F8FC]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#4C97DB]/15 text-[#4C97DB] font-bold text-xs flex items-center justify-center shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#263445]">{emp.name}</div>
                        <div className="text-[11px] text-[#718096] font-mono">
                          {emp.matricule} · {emp.role}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs bg-[#F5F8FC] border border-[#E5EAF1] text-[#263445] font-medium">
                      {emp.department}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-[#718096]">
                    <div className="flex items-center gap-1.5">
                      <IconClock stroke={1.75} className="w-3.5 h-3.5 text-[#4C97DB]" />
                      <span>{emp.shift}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-[#718096]">
                    <div className="text-xs">{emp.phone}</div>
                    <div className="text-[11px] text-[#718096]/80">{emp.email}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#263445]">
                    {emp.salary.toLocaleString('fr-FR')} FCFA
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(emp.status)}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#4C97DB] hover:bg-[#4C97DB]/10 rounded-lg transition-colors"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => {
                        const nextStatus: Employee['status'] =
                          emp.status === 'Actif'
                            ? 'En congé'
                            : emp.status === 'En congé'
                            ? 'Inactif'
                            : 'Actif';
                        updateEmployeeStatus(emp.id, nextStatus);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-[#718096] hover:text-[#4C97DB] hover:bg-[#F5F8FC] rounded-lg transition-colors"
                      title="Changer le statut"
                    >
                      Statut
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails Employé */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4C97DB]/10 text-[#4C97DB] flex items-center justify-center font-bold text-sm">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263445]">{selectedEmployee.name}</h3>
                  <p className="text-xs text-[#718096]">{selectedEmployee.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex justify-between items-center">
                <span className="text-[#718096]">Matricule RH</span>
                <span className="font-mono font-bold text-[#263445]">{selectedEmployee.matricule}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex justify-between items-center">
                <span className="text-[#718096]">Département</span>
                <span className="font-semibold text-[#263445]">{selectedEmployee.department}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex justify-between items-center">
                <span className="text-[#718096]">Horaire de travail</span>
                <span className="font-medium text-[#263445]">{selectedEmployee.shift}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex justify-between items-center">
                <span className="text-[#718096]">Rémunération brute</span>
                <span className="font-mono font-bold text-emerald-600">
                  {selectedEmployee.salary.toLocaleString('fr-FR')} FCFA / mois
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex justify-between items-center">
                <span className="text-[#718096]">Date d'embauche</span>
                <span className="font-medium text-[#263445]">{selectedEmployee.hireDate}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex justify-between items-center">
                <span className="text-[#718096]">Statut</span>
                {getStatusBadge(selectedEmployee.status)}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5EAF1] flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096] hover:bg-[#E5EAF1]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter un Employé */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF1]">
              <h3 className="text-base font-bold text-[#263445]">Nouveau collaborateur</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-[#718096] hover:text-[#263445]"
              >
                <IconX stroke={1.75} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#263445] mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Yao Koffi Jean"
                  className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">Poste occupé *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="ex: Réceptionniste"
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">Département</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Employee['department'])}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Réception">Réception</option>
                    <option value="Hébergement & Ménage">Hébergement & Ménage</option>
                    <option value="Restaurant & Bar">Restaurant & Bar</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Sécurité & Technique">Sécurité & Technique</option>
                    <option value="Direction">Direction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">Horaire (Shift)</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as Employee['shift'])}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  >
                    <option value="Matin (07h-15h)">Matin (07h-15h)</option>
                    <option value="Soir (15h-23h)">Soir (15h-23h)</option>
                    <option value="Nuit (23h-07h)">Nuit (23h-07h)</option>
                    <option value="Journée (08h-17h)">Journée (08h-17h)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">Salaire brut (FCFA)</label>
                  <input
                    type="number"
                    min="50000"
                    step="5000"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#263445] mb-1">Email professionnel</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@galaxyhotel.ci"
                    className="w-full px-3 py-2 bg-white border border-[#E5EAF1] rounded-xl text-[#263445]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5EAF1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F5F8FC] text-[#718096] hover:bg-[#E5EAF1]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#4C97DB] hover:bg-[#58A2F7] text-white"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
