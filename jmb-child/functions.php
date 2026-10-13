<?php
/**
 * Bela Canaã Alianças
 * Desenvolvido por Smart Local
 */

// 1. Redireciona acessos single/arquivos do WP para o Front-end (caso acessem links do WP vindos do Google)
add_action('template_redirect', 'smart_local_redirecionar_para_frontend');
function smart_local_redirecionar_para_frontend() {
    // Se não for a tela de login, o painel admin, ou chamadas de API, joga para o front-end
    if (!is_admin() && !$file && !defined('REST_REQUEST')) {
        $slug = get_post_field('post_name', get_post());
        $post_type = get_post_type();
        
        // Se for um post do blog, joga para a rota interna correspondente no React
        if (is_single() && $post_type == 'post') {
            wp_redirect('https://jmbcapotas.com.br/' . $slug, 301);
            exit;
        }
        
        // Fallback para qualquer outra página residual
        wp_redirect('https://jmbcapotas.com.br', 301);
        exit;
    }
}

// 2. Remove os links visuais de "Adicionar Novo" nos submenus laterais
add_action('admin_menu', 'smart_local_ocultar_submenus_adicionar', 999);
function smart_local_ocultar_submenus_adicionar() {
    global $submenu;
    $cpts = array('site-config');
    
    foreach ($cpts as $cpt) {
        $menu_slug = 'edit.php?post_type=' . $cpt;
        if (isset($submenu[$menu_slug])) {
            foreach ($submenu[$menu_slug] as $key => $value) {
                if (in_array('post-new.php?post_type=' . $cpt, $value)) {
                    unset($submenu[$menu_slug][$key]);
                }
            }
        }
    }
}

// 3. Altera as capacidades no Core do WordPress (Bloqueia criação e lixeira de Single Instances)
add_action('init', 'smart_local_travar_capabilities_single_instance', 999);
function smart_local_travar_capabilities_single_instance() {
    global $wp_post_types;
    $cpts = array('site-config');
    
    foreach ($cpts as $cpt) {
        if (isset($wp_post_types[$cpt])) {
            $wp_post_types[$cpt]->cap->create_posts  = 'do_not_allow';
            $wp_post_types[$cpt]->cap->delete_posts  = 'do_not_allow';
        }
    }
}

// 4. Remove a ação de linha "Colocar na Lixeira" na listagem administrativa
add_filter('post_row_actions', 'smart_local_remover_links_lixeira', 10, 2);
function smart_local_remover_links_lixeira($actions, $post) {
    $cpts = array('site-config');
    if (in_array($post->post_type, $cpts)) {
        unset($actions['trash']);
    }
    return $actions;
}

// 5. Oculta visualmente o link "Mover para lixeira" dentro do editor do CPT 'site'
add_action('admin_head-post.php', 'smart_local_ocultar_link_lixeira_editor');
add_action('admin_head-post-new.php', 'smart_local_ocultar_link_lixeira_editor');

function smart_local_ocultar_link_lixeira_editor() {
    $screen = get_current_screen();
    
    // Alvo estrito: apenas executa se for o CPT cadastrado na sua engine
    if (is_object($screen) && $screen->post_type === 'site-config') {
        echo '<style>
            #delete-action {
                display: none !important;
            }
            /* Opcional: Ajusta o alinhamento do botão Atualizar para ocupar o espaço */
            #publishing-action {
                text-align: right;
                float: right;
                width: 100%;
            }
        </style>';
    }
}


/**
 * 6. Personaliza a listagem administrativa de Produtos
 * CPT: produto
 * ACF: codigo_produto
 */

// Adiciona as colunas Imagem e Código.
add_filter('manage_produto_posts_columns', 'smart_local_products_admin_columns');

function smart_local_products_admin_columns($columns) {
    $new_columns = array();

    foreach ($columns as $key => $label) {
        $new_columns[$key] = $label;

        if ($key === 'cb') {
            $new_columns['product_image'] = 'Imagem';
        }

        if ($key === 'title') {
            $new_columns['product_code'] = 'Código';
        }
    }

    return $new_columns;
}

// Preenche as colunas personalizadas.
add_action(
    'manage_produto_posts_custom_column',
    'smart_local_products_admin_column_content',
    10,
    2
);

function smart_local_products_admin_column_content($column, $post_id) {
    if ($column === 'product_image') {
        if (has_post_thumbnail($post_id)) {
            echo get_the_post_thumbnail(
                $post_id,
                array(70, 70),
                array(
                    'style' => 'width:70px;height:70px;object-fit:cover;border-radius:4px;'
                )
            );
        } else {
            echo '<span style="color:#999;">Sem imagem</span>';
        }
    }

    if ($column === 'product_code') {
        $code = get_post_meta($post_id, 'codigo_produto', true);

        if ($code !== '') {
            echo '<strong>' . esc_html($code) . '</strong>';
        } else {
            echo '<span style="color:#999;">—</span>';
        }
    }
}

// Estiliza as colunas.
add_action('admin_head-edit.php', 'smart_local_products_admin_columns_style');

function smart_local_products_admin_columns_style() {
    $screen = get_current_screen();

    if (
        !is_object($screen) ||
        $screen->post_type !== 'produto'
    ) {
        return;
    }

    echo '<style>
        .wp-list-table .column-product_image {
            width: 90px;
        }

        .wp-list-table .column-product_code {
            width: 140px;
        }

        .wp-list-table .column-product_image img {
            display: block;
        }
    </style>';
}

/**
 * Pesquisa administrativa por código do produto.
 *
 * Mantém a pesquisa nativa do WordPress por título,
 * conteúdo e resumo, acrescentando codigo_produto.
 *
 * Utiliza posts_search e EXISTS para evitar JOINs
 * desnecessários e resultados duplicados.
 */
add_filter('posts_search', 'smart_local_products_search_by_code', 10, 2);

function smart_local_products_search_by_code($search_sql, $query) {
    if (
        !is_admin() ||
        !$query->is_main_query() ||
        $query->get('post_type') !== 'produto'
    ) {
        return $search_sql;
    }

    $search_term = $query->get('s');

    if (
        !is_string($search_term) ||
        trim($search_term) === '' ||
        $search_sql === ''
    ) {
        return $search_sql;
    }

    global $wpdb;

    $like = '%' . $wpdb->esc_like(trim($search_term)) . '%';

    $code_sql = $wpdb->prepare(
        "EXISTS (
            SELECT 1
            FROM {$wpdb->postmeta} AS code_meta
            WHERE code_meta.post_id = {$wpdb->posts}.ID
              AND code_meta.meta_key = %s
              AND code_meta.meta_value LIKE %s
        )",
        'codigo_produto',
        $like
    );

    // Acrescenta a busca por código à condição nativa.
    // O WP já inclui as regras de busca e permissões
    // pertinentes à consulta administrativa.
    $prefix = ' AND (';

    if (strpos($search_sql, $prefix) === 0) {
        $native_condition = substr($search_sql, strlen(' AND '));

        return ' AND (' . $native_condition . ' OR ' . $code_sql . ')';
    }

    return $search_sql;
}

/**
 * Torna a coluna Código ordenável.
 */
add_filter(
    'manage_edit-produto_sortable_columns',
    'smart_local_products_sortable_columns'
);

function smart_local_products_sortable_columns($columns) {
    $columns['product_code'] = 'product_code';
    return $columns;
}

/**
 * Ordena os produtos pelo campo ACF codigo_produto.
 */
add_action('pre_get_posts', 'smart_local_products_order_by_code');

function smart_local_products_order_by_code($query) {
    if (
        !is_admin() ||
        !$query->is_main_query() ||
        $query->get('post_type') !== 'produto'
    ) {
        return;
    }

    if ($query->get('orderby') === 'product_code') {
        $query->set('meta_key', 'codigo_produto');
        $query->set('orderby', 'meta_value');
    }
}



/**
 * Permite que Editores utilizem o WP REST Cache.
 */
add_filter('wp_rest_cache/settings_capability', function ($capability) {
    return 'edit_posts';
});
