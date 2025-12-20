import os

# ==============================
# CONFIGURACIÓN
# ==============================

# Carpetas a excluir
EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "__pycache__",
    "uploads"
}

# Archivos a excluir (por nombre exacto)
EXCLUDE_FILES = {
    "generar_contexto.py",
    "package-lock.json",
    "contexto.txt"
}

# Extensiones a excluir
EXCLUDE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp",
    ".zip", ".rar", ".7z",
    ".exe", ".dll",
    ".pdf"
}

OUTPUT_FILE = "contexto.txt"

# Tamaño máximo de archivo (en bytes)
MAX_FILE_SIZE = 1_000_000  # 1 MB


# ==============================
# ÁRBOL ASCII
# ==============================

def generar_arbol_ascii(root_path):
    lineas = []

    def recorrer(path, prefix=""):
        try:
            items = sorted(os.listdir(path))
        except PermissionError:
            return

        items = [i for i in items if i not in EXCLUDE_DIRS]

        for i, item in enumerate(items):
            full_path = os.path.join(path, item)
            is_last = i == len(items) - 1

            connector = "└── " if is_last else "├── "
            lineas.append(prefix + connector + item)

            if os.path.isdir(full_path):
                extension = "    " if is_last else "│   "
                recorrer(full_path, prefix + extension)

    lineas.append(os.path.basename(os.path.abspath(root_path)))
    recorrer(root_path)
    return "\n".join(lineas)


# ==============================
# COPIAR CONTENIDO DE ARCHIVOS
# ==============================

def copiar_contenido_archivos(root_path, output):
    for dirpath, dirnames, filenames in os.walk(root_path):
        # Filtrar carpetas excluidas
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

        for filename in filenames:
            # Excluir archivos por nombre
            if filename in EXCLUDE_FILES:
                continue

            file_path = os.path.join(dirpath, filename)

            # Excluir por extensión
            _, ext = os.path.splitext(filename)
            if ext.lower() in EXCLUDE_EXTENSIONS:
                continue

            # Excluir archivos grandes
            try:
                if os.path.getsize(file_path) > MAX_FILE_SIZE:
                    continue
            except OSError:
                continue

            relative_path = os.path.relpath(file_path, root_path)

            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    contenido = f.read()
            except UnicodeDecodeError:
                contenido = "[ARCHIVO BINARIO O CODIFICACIÓN NO UTF-8]"
            except Exception as e:
                contenido = f"[ERROR AL LEER EL ARCHIVO: {e}]"

            output.write("\n\n")
            output.write(f"//=={relative_path}==\n")
            output.write("//--contenido del archivo\n")
            output.write(contenido)


# ==============================
# MAIN
# ==============================

def main():
    root_path = os.getcwd()

    arbol = generar_arbol_ascii(root_path)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as output:
        output.write("=== ÁRBOL DE CARPETAS ===\n\n")
        output.write(arbol)
        output.write("\n\n=== CONTENIDO DE ARCHIVOS ===")

        copiar_contenido_archivos(root_path, output)

    print(f"✅ Archivo '{OUTPUT_FILE}' generado correctamente.")


if __name__ == "__main__":
    main()
