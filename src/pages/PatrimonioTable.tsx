import { useState, useMemo } from "react";
import { patrimonioData } from "@/constants/data";
import { PatrimonioItem } from "@/types/patrimonio";
import { Search, Download, FileSpreadsheet, ArrowUp01, ArrowUpAZ, Plus, Trash2, X, Save, Pencil } from "lucide-react";

const EMPTY_FORM: PatrimonioItem = { patrimonio: "", placaSerie: "", cod: "", material: "", localEquipamento: "" };

export default function PatrimonioTable() {
  const [items, setItems] = useState<PatrimonioItem[]>(patrimonioData);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PatrimonioItem>(EMPTY_FORM);
  const [editingPatrimonio, setEditingPatrimonio] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isEditing = editingPatrimonio !== null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.patrimonio.toLowerCase().includes(q) ||
        item.placaSerie.toLowerCase().includes(q) ||
        item.cod.toLowerCase().includes(q) ||
        item.material.toLowerCase().includes(q)
    );
  }, [search, items]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, string>)[sortCol] ?? "";
      const bv = (b as Record<string, string>)[sortCol] ?? "";
      return sortDir === "asc"
        ? av.localeCompare(bv)
        : bv.localeCompare(av);
    });
  }, [filtered, sortCol, sortDir]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const handleDelete = (patrimonio: string) => {
    if (deleteConfirm === patrimonio) {
      setItems((prev) => prev.filter((i) => i.patrimonio !== patrimonio));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(patrimonio);
    }
  };

  const openAddModal = () => {
    setEditingPatrimonio(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (item: PatrimonioItem) => {
    setDeleteConfirm(null);
    setEditingPatrimonio(item.patrimonio);
    setForm({ ...item });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.patrimonio.trim() || !form.material.trim()) return;

    if (isEditing) {
      // Update existing item
      setItems((prev) =>
        prev.map((i) => (i.patrimonio === editingPatrimonio ? { ...form } : i))
      );
    } else {
      // Add new item
      setItems((prev) => [...prev, { ...form }]);
    }

    setForm(EMPTY_FORM);
    setEditingPatrimonio(null);
    setShowModal(false);
  };

  const handleFormChange = (field: keyof PatrimonioItem, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPatrimonio(null);
    setForm(EMPTY_FORM);
  };

  const exportCSV = () => {
    const headers = ["PATRIMONIO", "PLACA/SERIE", "COD", "MATERIAL", "LOCAL DO EQUIPAMENTO"];
    const rows = sorted.map((item: PatrimonioItem) =>
      [
        item.patrimonio,
        item.placaSerie,
        item.cod,
        `"${item.material.replace(/"/g, '""')}"`,
        `"${(item.localEquipamento || "").replace(/"/g, '""')}"`,
      ].join(";")
    );
    const csvContent = [headers.join(";"), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "carga_patrimonial.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: "patrimonio", label: "PATRIMÔNIO", width: "w-[130px]" },
    { key: "placaSerie", label: "PLACA/SÉRIE", width: "w-[110px]" },
    { key: "cod", label: "COD", width: "w-[110px]" },
    { key: "material", label: "MATERIAL", width: "" },
    { key: "localEquipamento", label: "LOCAL DO EQUIPAMENTO", width: "w-[180px]" },
    { key: "acoes", label: "", width: "w-[80px]" },
  ];

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <span className="ml-1 opacity-30">⇅</span>;
    return (
      <span className="ml-1 text-blue-400">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
              Carga Patrimonial de Bens Móveis
            </h1>
            <p className="text-slate-400 text-sm">
              CBMMG - Posto Avançado de Boa Esperança
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por patrimônio, material, código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          {/* Quick Sort Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => { setSortCol("patrimonio"); setSortDir("asc"); }}
              title="Ordenar por Patrimônio crescente"
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-lg border transition-colors duration-200 whitespace-nowrap ${
                sortCol === "patrimonio" && sortDir === "asc"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <ArrowUp01 className="w-4 h-4" />
              <span className="hidden sm:inline">Patrimônio</span>
            </button>
            <button
              onClick={() => { setSortCol("material"); setSortDir("asc"); }}
              title="Ordenar por Material A-Z"
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-lg border transition-colors duration-200 whitespace-nowrap ${
                sortCol === "material" && sortDir === "asc"
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <ArrowUpAZ className="w-4 h-4" />
              <span className="hidden sm:inline">Material A-Z</span>
            </button>
          </div>
          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
        {/* Stats + Add Button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-4 text-sm text-slate-400">
            <span>
              <span className="text-white font-semibold">{sorted.length}</span>{" "}
              {sorted.length === 1 ? "item encontrado" : "itens encontrados"}
            </span>
            {search && (
              <span>
                de{" "}
                <span className="text-white font-semibold">{items.length}</span>{" "}
                no total
              </span>
            )}
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            Adicionar Material
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="mb-2 text-lg text-slate-500">
        Clique no número de patrimônio para editar o item.
      </p>

      {/* Table */}
      <div className="rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 border-b border-slate-600">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== "acoes" && handleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider select-none transition-colors ${col.width} ${
                      col.key !== "acoes" ? "cursor-pointer hover:bg-slate-600" : ""
                    }`}
                  >
                    {col.label}
                    {col.key !== "acoes" && <SortIcon col={col.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Nenhum item encontrado para "{search}"
                  </td>
                </tr>
              ) : (
                sorted.map((item, idx) => (
                  <tr
                    key={`${item.patrimonio}-${idx}`}
                    className={`border-b border-slate-700/50 transition-colors hover:bg-slate-700/40 ${
                      idx % 2 === 0 ? "bg-slate-800" : "bg-slate-800/60"
                    }`}
                    onClick={() => deleteConfirm && setDeleteConfirm(null)}
                  >
                    {/* Patrimônio — clicável para editar */}
                    <td
                      className="px-4 py-3 whitespace-nowrap"
                      onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                    >
                      <span className="font-mono text-blue-400 font-semibold cursor-pointer underline underline-offset-2 decoration-dotted hover:text-blue-300 transition-colors flex items-center gap-1 group">
                        {item.patrimonio}
                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-yellow-400 font-semibold whitespace-nowrap">
                      {item.placaSerie || (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300 whitespace-nowrap">
                      {item.cod}
                    </td>
                    <td className="px-4 py-3 text-slate-200 leading-snug max-w-[400px]">
                      {item.material}
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {item.localEquipamento || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Editar item"
                          className="p-1.5 rounded text-slate-500 hover:text-yellow-400 hover:bg-slate-700 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.patrimonio)}
                          title={
                            deleteConfirm === item.patrimonio
                              ? "Clique novamente para confirmar"
                              : "Excluir item"
                          }
                          className={`p-1.5 rounded transition-colors ${
                            deleteConfirm === item.patrimonio
                              ? "bg-red-600 text-white animate-pulse"
                              : "text-slate-500 hover:text-red-400 hover:bg-slate-700"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-xs text-slate-500">
        Fonte: RPATR805 — Sistema Integrado de Administração · Data: 15/04/2026
      </p>

      {/* Modal Adicionar / Editar Material */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Pencil className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Plus className="w-5 h-5 text-blue-400" />
                )}
                <h2 className="text-white font-bold text-lg">
                  {isEditing ? `Editar — ${editingPatrimonio}` : "Adicionar Material"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Patrimônio <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.patrimonio}
                  onChange={(e) => handleFormChange("patrimonio", e.target.value)}
                  placeholder="Ex: 1234567-8"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Placa / Série
                  </label>
                  <input
                    type="text"
                    value={form.placaSerie}
                    onChange={(e) => handleFormChange("placaSerie", e.target.value)}
                    placeholder="Ex: ABC1234"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    COD
                  </label>
                  <input
                    type="text"
                    value={form.cod}
                    onChange={(e) => handleFormChange("cod", e.target.value)}
                    placeholder="Ex: 000123456"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Material <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.material}
                  onChange={(e) => handleFormChange("material", e.target.value)}
                  placeholder="Descrição completa do material..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Local do Equipamento
                </label>
                <input
                  type="text"
                  value={form.localEquipamento}
                  onChange={(e) => handleFormChange("localEquipamento", e.target.value)}
                  placeholder="Ex: Sala de Comando"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-slate-500">* Campos obrigatórios</p>
            </div>
            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.patrimonio.trim() || !form.material.trim()}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors ${
                  isEditing
                    ? "bg-yellow-600 hover:bg-yellow-500"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                <Save className="w-4 h-4" />
                {isEditing ? "Salvar Alterações" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
